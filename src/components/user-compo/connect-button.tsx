"use client"

import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { client } from "@/lib/client";

// Define Flow Sepolia chain
const flowSepolia = defineChain({
  id: 545,
  name: "Flow Sepolia",
  rpc: "https://545.rpc.thirdweb.com/${03f092660bdbfc754d7653b01c86e7b9}",
  nativeCurrency: {
    name: "FLOW",
    symbol: "FLOW",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Flow Sepolia Blockscout",
      url: "https://evm-testnet.flowscan.io/",
    },
  ],
  testnet: true,
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.trustwallet.app"),
  createWallet("com.valoraapp"),
  inAppWallet({
    auth: {
      options: ["email", "google", "apple", "facebook"],
    },
  }),
];

export function WalletConnectButton() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      theme={"dark"}
      chains={[flowSepolia]}
    />
  );
}
