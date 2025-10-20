"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useVakinha } from "../hooks/useVakinha";
import { useDonate } from "../hooks/useDonate";
import { useWithdraw } from "../hooks/useWithdrawn";
import Image from "next/image";

interface VakinhaDetailCardProps {
  vakinhaId: string;
}

export function VakinhaDetailCard({ vakinhaId }: VakinhaDetailCardProps) {
  const { vakinha, loading } = useVakinha(vakinhaId);
  const { donate } = useDonate();
  const { withdraw } = useWithdraw();
  const currentAccount = useCurrentAccount();
  const [donationAmount, setDonationAmount] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  if (loading) {
    return <div className="text-white">Carregando...</div>;
  }

  if (!vakinha) {
    return <div className="text-red-500">Vakinha não encontrada</div>;
  }

  const handleDonate = async () => {
    if (!donationAmount || Number(donationAmount) <= 0) {
      return;
    }

    setIsDonating(true);
    const amountInMist = Math.floor(Number(donationAmount) * 1_000_000_000);

    await donate(vakinhaId, amountInMist);
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    await withdraw(vakinhaId);
  };

  const progress = Math.min(
    (vakinha.amountDonated / vakinha.goalAmount) * 100,
    100
  );
  const isOwner = currentAccount?.address === vakinha.owner;
  const amountInSUI = (vakinha.amountDonated / 1_000_000_000).toFixed(2);
  const goalInSUI = (vakinha.goalAmount / 1_000_000_000).toFixed(2);

  const imageUrl = `/api/walrus-image?blobId=${encodeURIComponent(
    vakinha.imageUrl
  )}`;

  return (
    <div className="bg-[var(--background-20)] rounded-2xl overflow-hidden shadow-2xl">
      {/* Imagem grande */}
      <div className="relative h-96 w-full overflow-hidden bg-gray-800">
        <Image
          src={imageUrl}
          alt={vakinha.name}
          fill
          className="w-full h-full object-cover"
        />
        {!vakinha.isActive && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-lg font-semibold">
            Inativa
          </div>
        )}
        {isOwner && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-semibold">
            Sua Vakinha
          </div>
        )}
      </div>

      <div className="px-4 py-2 space-y-3">
        {/* Título e Descrição */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">{vakinha.name}</h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            {vakinha.description}
          </p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-lg mb-3">
            <span className="text-gray-400">Progresso</span>
            <span className="text-white font-bold">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[var(--background-10)] p-6 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Arrecadado</p>
            <p className="text-white font-bold text-2xl">{amountInSUI} SUI</p>
          </div>
          <div className="bg-[var(--background-10)] p-6 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Meta</p>
            <p className="text-white font-bold text-2xl">{goalInSUI} SUI</p>
          </div>
        </div>

        {/* Doação */}
        {vakinha.isActive && !isOwner && (
          <div className="bg-[var(--background-10)] p-6 rounded-xl space-y-4">
            <h3 className="text-xl font-bold text-white">Fazer uma doação</h3>
            <input
              type="number"
              step="0.01"
              placeholder="Valor em SUI"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--background-20)] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-lg"
              disabled={isDonating}
            />
            <button
              onClick={handleDonate}
              disabled={isDonating}
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-600 text-lg"
            >
              {isDonating ? "Doando..." : "💝 Doar agora"}
            </button>
          </div>
        )}

        {/* Saque */}
        {isOwner && vakinha.isActive && vakinha.amountDonated > 0 && (
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-lg"
          >
            {isWithdrawing ? "Sacando..." : "💰 Sacar Fundos"}
          </button>
        )}

        {/* Info do Owner */}
        <div className="pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Criado por:{" "}
            <span className="text-white font-mono">{vakinha.owner}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
