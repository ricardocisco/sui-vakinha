"use client";

import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { VakinhaDetailCard } from "@/app/components/VakinhaDetailCard";
import Link from "next/link";

export default function VakinhaDetailPage() {
  const params = useParams();
  const vakinhaId = params.id as string;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-10)]">
      <Navbar />

      <div className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
          >
            ← Voltar para vakinhas
          </Link>

          {/* Card detalhado */}
          <VakinhaDetailCard vakinhaId={vakinhaId} />
        </div>
      </div>
    </div>
  );
}
