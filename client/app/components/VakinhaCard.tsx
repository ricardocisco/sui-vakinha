"use client";

import Image from "next/image";
import Link from "next/link";

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

export function VakinhaCard({ vakinha }: { vakinha: VakinhaEvent }) {
  const imageUrl = `/api/walrus-image?blobId=${encodeURIComponent(
    vakinha.imageUrl
  )}`;

  return (
    <Link
      href={`/vakinha/campaign/${vakinha.vakinhaId}`}
      className="hover:scale-105"
    >
      <div className="text-white bg-[var(--background-30)] rounded-lg">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={vakinha.name}
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-64 object-cover rounded-lg"
          />
        )}

        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">{vakinha.name}</h2>
          <p className="text-gray-300 mb-2">{vakinha.description}</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Meta:</span>
              <span className="text-sm font-semibold">
                {(vakinha.goalAmount / 1e9).toFixed(2)} SUI
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Doado:</span>
              <span className="text-sm font-semibold">
                {(vakinha.amountDonated / 1e9).toFixed(2)} SUI
              </span>
            </div>

            {/* Barra de progresso */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    (vakinha.amountDonated / vakinha.goalAmount) * 100,
                    100
                  )}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
