import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
});

export const primordialTestnet = defineChain({
  id: 1043,
  name: "Primordial BlockDAG Testnet",
  nativeCurrency: {
    name: "Primordial BlockDAG",
    symbol: "BDAG",
    decimals: 18,
  },
  rpc: "https://rpc.primordial.bdagscan.com",
  blockExplorers: [
    {
      name: "Primordial Explorer",
      url: "https://primordial.bdagscan.com/",
    },
  ],
  testnet: true,
});
