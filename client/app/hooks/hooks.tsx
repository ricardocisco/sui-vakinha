// hooks/useCreateVakinha.ts
import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient, WalrusFile } from "@mysten/walrus";

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;

const client = new SuiClient({
  url: getFullnodeUrl("testnet")
});

const walrusClient = new WalrusClient({
  network: "testnet",
  suiClient: client,
  uploadRelay: {
    host: "https://upload-relay.testnet.walrus.space",
    sendTip: {
      max: 1_000
    }
  },
  wasmUrl:
    "https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm"
});

export function useCreateVakinha() {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [blobId, setBlobId] = useState<string>("");

  const uploadToWalrus = async (file: File): Promise<string> => {
    if (!currentAccount) {
      throw new Error("Conecte sua carteira primeiro");
    }

    setIsUploading(true);

    try {
      console.log("📤 Preparando arquivo para upload...");

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const files = [
        WalrusFile.from({
          contents: uint8Array,
          identifier: file.name,
          tags: {
            mimeType: file.type
          }
        })
      ];

      // Iniciar o flow de upload
      const flow = walrusClient.writeFilesFlow({ files });

      // 1. Encode
      console.log("🔄 Encodando arquivo...");
      await flow.encode();

      // 2. Register (primeira transação)
      console.log("📝 Registrando na blockchain...");
      const { digest: registerDigest } = await signAndExecuteTransaction({
        transaction: flow.register({
          deletable: true, // Pode ser deletado depois
          epochs: 10, // Armazena por 10 epochs (~30 dias)
          owner: currentAccount.address // Dono do arquivo
        })
      });

      // 3. Upload do arquivo
      console.log("⬆️  Fazendo upload do arquivo...");
      await flow.upload({ digest: registerDigest });

      // 4. Certify (segunda transação)
      console.log("✅ Certificando...");
      await signAndExecuteTransaction({
        transaction: flow.certify()
      });

      // 5. Pegar o blob ID
      const result = await flow.listFiles();
      const uploadedBlobId = result[0].blobId;

      console.log("🎉 Upload completo! Blob ID:", uploadedBlobId);
      setBlobId(uploadedBlobId);

      return uploadedBlobId;
    } catch (error) {
      console.error("❌ Erro no upload:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const createVakinha = async (
    name: string,
    description: string,
    goalAmount: number,
    imageFile: File,
    onSuccess?: (vakinhaId: string) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      setIsCreating(true);

      // 1. Upload da imagem para o Walrus (2 transações)
      const uploadedBlobId = await uploadToWalrus(imageFile);

      // 2. Converter SUI para MIST
      const goalAmountInMist = Math.floor(goalAmount * 1_000_000_000);

      // 3. Criar vakinha na blockchain (terceira transação)
      console.log("🏗️  Criando vakinha...");
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::vakinha::create_vakinha`,
        arguments: [
          tx.pure.string(name),
          tx.pure.string(uploadedBlobId), // Blob ID do Walrus
          tx.pure.string(description),
          tx.pure.u64(goalAmountInMist)
        ]
      });

      // 4. Executar transação
      const result = await signAndExecuteTransaction({
        transaction: tx
      });

      console.log("✅ Vakinha criada com sucesso!", result);

      // Pegar o ID da vakinha dos objetos criados
      const vakinhaId = result.effects?.created?.[0]?.reference?.objectId;

      if (vakinhaId && onSuccess) {
        onSuccess(vakinhaId);
      }
    } catch (err) {
      console.error("❌ Erro:", err);
      if (onError) {
        onError(err as Error);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createVakinha,
    isUploading,
    isCreating,
    isLoading: isUploading || isCreating,
    blobId
  };
}
