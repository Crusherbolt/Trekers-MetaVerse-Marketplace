import React from "react";
import {
  useActiveAccount,
  TransactionButton,
  useReadContract,
} from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import HeroCard from "../../components/hero-card";
import styles from "../../styles/Home.module.css";
import { ERC20_CONTRACT_ADDRESS } from "../../const/addresses";
import Link from "next/link";
import {
  client,
  primordialTestnet,
} from "../../lib/client";

export default function ERC20Project() {
  // Get the connected wallet/account
  const account = useActiveAccount();
  const address = account?.address;

  // Get the contract instance
  const contract = getContract({
    client,
    chain: primordialTestnet,
    address: ERC20_CONTRACT_ADDRESS,
  });

  // Read contract name, symbol, and contractURI (for metadata)
  const { data: name, isLoading: isNameLoading } =
    useReadContract({
      contract,
      method: "function name() view returns (string)",
    });

  const { data: symbol } = useReadContract({
    contract,
    method: "function symbol() view returns (string)",
  });

  const { data: contractURI } = useReadContract({
    contract,
    method: "function contractURI() view returns (string)",
  });

  // Fetch metadata from contractURI
  const [metadata, setMetadata] = React.useState<any>(null);
  React.useEffect(() => {
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

  // Read total supply
  const {
    data: totalSupply,
    isLoading: isTokenSupplyLoading,
  } = useReadContract({
    contract,
    method: "function totalSupply() view returns (uint256)",
  });

  // Read token balance
  const {
    data: tokenBalance,
    isLoading: isTokenBalanceLoading,
  } = useReadContract({
    contract,
    method:
      "function balanceOf(address) view returns (uint256)",
    params: [address],
  });

  return (
    <div className={styles.container}>
      <HeroCard
        isLoading={isNameLoading}
        title={name || ""}
        description={metadata?.description || ""}
        image={metadata?.image}
      />
      <div className={styles.grid}>
        <div className={styles.componentCard}>
          <h3>Token Stats</h3>
          {isTokenSupplyLoading ? (
            <p>Loading supply...</p>
          ) : (
            <p>
              Total Supply: {totalSupply?.toString()}{" "}
              {symbol}
            </p>
          )}
        </div>
        <div className={styles.componentCard}>
          <h3>Token Balance</h3>
          {isTokenBalanceLoading ? (
            <p>Loading balance...</p>
          ) : (
            <p>
              Balance: {tokenBalance?.toString()} {symbol}
            </p>
          )}
          <TransactionButton
            transaction={() => {
              // Prepare the burn transaction
              return prepareContractCall({
                contract,
                method: "function burn(uint256 amount)",
                params: [10n], // Note: Using BigInt for better precision
              });
            }}
          >
            Burn 10 Tokens
          </TransactionButton>
        </div>
        <div className={styles.componentCard}>
          <h3>Earn Tokens</h3>
          <p>Earn more tokens by staking an ERC-721 NFT.</p>
          <div>
            <Link href="/project/staking">
              <button className={styles.matchButton}>
                Stake ERC-721
              </button>
            </Link>
            <Link href="/project/staking">
              <button className={styles.matchButton}>
                Stake ERC-721
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}