import { useState, useEffect } from "react";
import { useSuiClient } from "@mysten/dapp-kit";

export function useVakinha(vakinhaId: string) {
  const client = useSuiClient();
  const [vakinha, setVakinha] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vakinhaId) return;

    const fetchVakinha = async () => {
      try {
        setLoading(true);

        const object = await client.getObject({
          id: vakinhaId,
          options: {
            showContent: true
          }
        });

        if (object.data?.content?.dataType === "moveObject") {
          const fields = object.data.content.fields as any;

          setVakinha({
            name: fields.name,
            imageUrl: fields.image_url,
            description: fields.description,
            owner: fields.owner,
            goalAmount: Number(fields.goal_amount),
            amountDonated: Number(fields.amount_donated),
            isActive: fields.is_active,
            balance: Number(fields.balance?.fields?.value || 0)
          });
        }
      } catch (error) {
        console.error("Erro ao buscar vakinha:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVakinha();
  }, [vakinhaId, client]);

  return { vakinha, loading };
}
