"use client";

import Image from "next/image";
import Navbar from "./components/Navbar";
import { Search } from "lucide-react";
import suiLogo from "@/public/assets/sui-coin.webp";
import VakinhaHero from "./components/VakinhaHero";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto mt-10 space-y-4 font-sans">
        <h1 className="text-center text-6xl font-bold text-[var(--color-purple-text)]">
          From wallet to world: crypto donations that matter.
        </h1>
        <div className="flex items-center md:gap-4 p-4 md:relative">
          <p className="text-center text-gray-400 text-2xl">
            Donate crypto and turn your digital assets into real-world impact.
            Fast, secure, and borderless.
          </p>
          <Image src={suiLogo} alt="logo sui" height={40} width={40} />
        </div>
      </main>
      <section className="max-w-4xl mx-auto mt-4 space-y-2 p-4 flex flex-col  items-center">
        <h2 className="text-white">Search for donations</h2>
        <div className="flex items-center w-full gap-1 rounded-md px-3 bg-[var(--background-30)]">
          <Search />
          <input
            type="text"
            placeholder="Search for donations"
            className="w-full text-white py-3 rounded-md focus:outline-none"
          />
        </div>
      </section>
      <VakinhaHero />
    </>
  );
}
