import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;

export function useDonate() {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const donate = async (
    vakinhaId: string,
    donationAmount: number,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    try {
      const tx = new Transaction();

      // Criar uma moeda com o valor da doação
      const [coin] = tx.splitCoins(tx.gas, [donationAmount]);

      tx.moveCall({
        target: `${PACKAGE_ID}::vakinha::donate`,
        arguments: [tx.object(vakinhaId), coin, tx.pure.u64(donationAmount)]
      });

      const result = await signAndExecuteTransaction({
        transaction: tx
      });

      console.log("Doação realizada!", result);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro ao doar:", error);
      if (onError) onError(error);
    }
  };

  return { donate };
}
