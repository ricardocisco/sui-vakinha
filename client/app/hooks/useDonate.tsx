import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;

export function useDonate() {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const client = useSuiClient();

  const donate = async (
    vakinhaId: string,
    donationAmount: number,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    try {
      const tx = new Transaction();

      const [coin] = tx.splitCoins(tx.gas, [donationAmount]);

      tx.moveCall({
        target: `${PACKAGE_ID}::vakinha::donate`,
        arguments: [tx.object(vakinhaId), coin, tx.pure.u64(donationAmount)]
      });

      const result = await signAndExecuteTransaction({
        transaction: tx
      });

      console.log("📋 Digest:", result.digest);

      console.log("⏳ Aguardando confirmação...");
      const txDetails = await client.waitForTransaction({
        digest: result.digest,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true
        }
      });

      console.log("📦 Detalhes da transação:", txDetails);
      console.log("✅ Effects:", txDetails.effects);

      const statusTx = txDetails.effects?.status?.status;
      const errorDetail = txDetails.effects?.status?.error;
      console.log("statusTx", statusTx);
      console.log("errorDetail", errorDetail);

      if (statusTx !== "success") {
        const error = errorDetail || "Transação falhou na blockchain";
        console.error("Transação falhou", error);
        console.error("Tipo do erro:", typeof error);

        if (error.includes("InsufficientCoinBalance")) {
          throw new Error(
            "Saldo insuficiente na carteira. Você precisa ter mais SUI para realizar esta doação + pagar o gas."
          );
        }

        throw new Error(error);
      }

      console.log("✅ Doação realizada com sucesso!");
      console.log(
        "🔗 Ver transação:",
        `https://testnet.suivision.xyz/txblock/${result.digest}`
      );

      if (onSuccess) onSuccess(result.digest);
    } catch (error: any) {
      console.error("Erro ao doar:", error);

      let errorMessage = error.message || "Erro desconhecido";

      if (
        errorMessage.includes("E_NO_FUNDS") ||
        errorMessage.includes("E_INSUFFICIENT_COIN_VALUE") ||
        errorMessage.includes("InsufficientCoinBalance")
      ) {
        errorMessage = "Saldo Insuficiente";
      } else if (
        errorMessage.includes("InsufficientGas") ||
        errorMessage.includes("Gas")
      ) {
        errorMessage = "Saldo insuficiente para pagar o gas da transação";
      } else if (errorMessage.includes("E_VAKINHA_INACTIVE")) {
        errorMessage = "Esta vakinha esta inativa";
      } else if (errorMessage.includes("E_INVALID_AMOUNT")) {
        errorMessage = "Valor da doação inválida";
      }

      if (onError) {
        onError(new Error(errorMessage));
      }
    }
  };

  return { donate };
}
