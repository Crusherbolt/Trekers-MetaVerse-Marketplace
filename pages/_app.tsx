import type { AppProps } from "next/app";
import { ThirdwebProvider } from "thirdweb/react";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { client } from "../lib/client"; // adjust path if needed

const primordialTestnet = {
  chainId: 1043,
  name: "Primordial BlockDAG Testnet",
  nativeCurrency: {
    name: "Primordial BlockDAG",
    symbol: "BDAG",
    decimals: 18,
  },
  rpc: ["https://rpc.primordial.bdagscan.com"],
  blockExplorers: [
    {
      name: "Primordial Explorer",
      url: "https://primordial.bdagscan.com/",
    },
  ],
  testnet: true,
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      client={client}
      activeChain={primordialTestnet}
    >
      <Navbar />
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
