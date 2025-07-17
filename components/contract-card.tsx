import Link from "next/link";
import styles from "../styles/Home.module.css";
import { MediaRenderer } from "thirdweb/react";
import { getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { useEffect, useState } from "react";
import { client, primordialTestnet } from "../lib/client";

type CardProps = {
  href: string;
  contractAddress: string;
  title: string;
  description: string;
};

export default function ContractCard(props: CardProps) {
  // 1. Get the contract instance using defineChain object
  const contract = getContract({
    client,
    chain: primordialTestnet,
    address: props.contractAddress,
  });

  // 2. Read contract name, symbol, and contractURI
  const { data: contractName, isLoading: isNameLoading } =
    useReadContract({
      contract,
      method: "function name() view returns (string)",
    });

  const { data: contractSymbol } = useReadContract({
    contract,
    method: "function symbol() view returns (string)",
  });

  const { data: contractURI } = useReadContract({
    contract,
    method: "function contractURI() view returns (string)",
  });

  // 3. Fetch metadata from contractURI
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (contractURI && typeof contractURI === "string") {
      let uri = contractURI;
      if (uri.startsWith("ipfs://")) {
        uri = uri.replace(
          "ipfs://",
          "https://ipfs.io/ipfs/",
        );
      }
      fetch(uri)
        .then((res) => res.json())
        .then(setMetadata)
        .catch(() => setMetadata(null));
    }
  }, [contractURI]);

  return (
    <Link href={props.href} className={styles.card}>
      {/* Show image if available */}
      <MediaRenderer
        src={metadata?.image}
        width="100%"
        height="auto"
        style={{
          borderRadius: "8px",
          marginBottom: "1rem",
        }}
      />
      <div className={styles.cardText}>
        <h2>
          {isNameLoading
            ? "Loading..."
            : contractName || props.title}
          {contractSymbol && ` (${contractSymbol})`}
        </h2>
        <p>{metadata?.description || props.description}</p>
        <div className={styles.contractAddress}>
          <small>Contract: {props.contractAddress}</small>
        </div>
      </div>
    </Link>
  );
}
