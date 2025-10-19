"use client";

import Image from "next/image";
import { ConnectButton } from "@mysten/dapp-kit";
import Link from "next/link";
import suiLogo from "@/public/assets/sui-coin.webp";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-[var(--background-20)]">
      <Link href="/" className="flex items-center gap-2">
        <Image src={suiLogo} alt="logo sui" height={40} width={40} />
        <p className="text-white text-lg font-semibold">Crypto Funding</p>
      </Link>
      <ul className="flex gap-4 text-white font-semibold">
        <Link href="vakinhas">Vakinhas</Link>
        <Link href="/vakinha/create">Criar uma nova</Link>
      </ul>
      <div>
        <ConnectButton />
      </div>
    </nav>
  );
}
