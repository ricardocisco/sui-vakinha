import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;

export function useWithdraw() {
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const withdraw = async (
    vakinhaId: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::vakinha::withdraw`,
        arguments: [tx.object(vakinhaId)]
      });

      const result = await signAndExecuteTransaction({
        transaction: tx
      });

      console.log("Saque realizado!", result);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro ao sacar:", error);
      if (onError) onError(error);
    }
  };

  return { withdraw };
}
