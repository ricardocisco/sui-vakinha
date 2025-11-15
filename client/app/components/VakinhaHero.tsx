import React, { useEffect } from "react";
import { useAllVakinhas } from "../hooks/useAllVakinhas";
import { VakinhaCard } from "./VakinhaCard";

export default function VakinhaHero({ searchTerm }: { searchTerm: string }) {
  const { vakinhas, loading, error, refetch } = useAllVakinhas();

  // Escutar mudanças no localStorage para atualizar lista quando nova vakinha é criada
  useEffect(() => {
    const checkForRefresh = () => {
      const needsRefresh = localStorage.getItem("vakinhaListNeedsRefresh");
      if (needsRefresh === "true") {
        localStorage.removeItem("vakinhaListNeedsRefresh");
        refetch();
      }
    };

    // Verificar imediatamente
    checkForRefresh();

    // Verificar periodicamente
    const interval = setInterval(checkForRefresh, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [refetch]);

  const vakinhaFilter = vakinhas.filter((vakinha) =>
    vakinha.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-white text-lg animate-pulse">
          Carregando vakinhas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-500 mb-2">Erro ao carregar as vaquinhas 😢</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <section className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {vakinhaFilter.length === 0 ? (
        <div className="flex w-full text-center text-gray-400">
          Nenhuma vakinha encontrada.
        </div>
      ) : (
        vakinhaFilter.map((vakinha, index) => (
          <VakinhaCard vakinha={vakinha} key={index} />
        ))
      )}
    </section>
  );
}
