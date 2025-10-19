import { useState, useEffect } from "react";
import { useSuiClient } from "@mysten/dapp-kit";

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;

interface VakinhaEvent {
  vakinhaId: string;
  name: string;
  description: string;
  imageUrl: string;
  owner: string;
  goalAmount: number;
  amountDonated: number;
  isActive: boolean;
}

export function useAllVakinhas() {
  const client = useSuiClient();
  const [vakinhas, setVakinhas] = useState<VakinhaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchVakinhas = async () => {
    if (!PACKAGE_ID) {
      setError("PACKAGE_ID não configurado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Buscar eventos de VakinhaCreated
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::vakinha::VakinhaCreated`
        }
      });

      const vakinhasList = events.data.map((event: any) => ({
        vakinhaId: event.parsedJson.vakinha_id,
        name: event.parsedJson.name,
        description: event.parsedJson.description,
        imageUrl: event.parsedJson.image_url,
        owner: event.parsedJson.owner,
        goalAmount: Number(event.parsedJson.goal_amount),
        amountDonated: Number(event.parsedJson.amount_donated),
        isActive: event.parsedJson.is_active
      }));

      setVakinhas(vakinhasList);
    } catch (err: any) {
      console.error("Erro ao buscar vakinhas:", err);
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVakinhas();
  }, [client]);

  return {
    vakinhas,
    loading,
    error,
    refetch: fetchVakinhas
  };
}
