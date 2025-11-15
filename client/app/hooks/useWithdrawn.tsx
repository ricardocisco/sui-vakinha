import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;

export function useWithdraw() {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const client = useSuiClient();

  const withdraw = async (
    vakinhaId: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void,
  ) => {
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::vakinha::withdraw`,
        arguments: [tx.object(vakinhaId)],
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      console.log("📋 Digest do saque:", result.digest);

      console.log("⏳ Aguardando confirmação do saque...");
      const txDetails = await client.waitForTransaction({
        digest: result.digest,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });

      console.log("📦 Detalhes da transação de saque:", txDetails);

      const statusTx = txDetails.effects?.status?.status;
      const errorDetail = txDetails.effects?.status?.error;

      if (statusTx !== "success") {
        const error = errorDetail || "Transação de saque falhou na blockchain";
        console.error("Transação de saque falhou", error);
        throw new Error(error);
      }

      console.log("✅ Saque realizado com sucesso!");
      console.log(
        "🔗 Ver transação:",
        `https://testnet.suivision.xyz/txblock/${result.digest}`,
      );

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro ao sacar:", error);

      let errorMessage = error.message || "Erro desconhecido";

      if (
        errorMessage.includes("E_NO_FUNDS") ||
        errorMessage.includes("E_INSUFFICIENT_BALANCE")
      ) {
        errorMessage = "Não há fundos suficientes para sacar";
      } else if (errorMessage.includes("E_NOT_OWNER")) {
        errorMessage = "Apenas o dono da vakinha pode sacar os fundos";
      } else if (errorMessage.includes("E_VAKINHA_INACTIVE")) {
        errorMessage = "Esta vakinha está inativa";
      }

      if (onError) onError(new Error(errorMessage));
    }
  };

  return { withdraw };
}
