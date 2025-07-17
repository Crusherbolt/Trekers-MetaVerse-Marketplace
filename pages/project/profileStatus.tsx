import React, { useState, useEffect } from "react";
import {
  useActiveAccount,
  TransactionButton,
  useReadContract,
} from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { ethers, formatEther } from "ethers";
import HeroCard from "../../components/hero-card";
import { TIP_JAR_CONTRACT_ADDRESS } from "../../const/addresses";
import styles from "../../styles/Home.module.css";
import {
  client,
  primordialTestnet,
} from "../../lib/client";

export default function TipJarProject() {
  const account = useActiveAccount();
  const address = account?.address;

  // Get contract instance
  const contract = getContract({
    client,
    chain: primordialTestnet,
    address: TIP_JAR_CONTRACT_ADDRESS,
  });

  // Read contract metadata (contractURI)
  const { data: contractURI } = useReadContract({
    contract,
    method: "function contractURI() view returns (string)",
  });

  // Fetch metadata from contractURI
  const [metadata, setMetadata] = useState<any>(null);
  useEffect(() => {
    if (contractURI && typeof contractURI === "string") {
      let uri = contractURI;
      if (uri.startsWith("ipfs://")) {
        uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      fetch(uri)
        .then((res) => res.json())
        .then(setMetadata)
        .catch(() => setMetadata(null));
    }
  }, [contractURI]);

  // Read tip jar balance
  const {
    data: tipJarBalance,
    isLoading: isTipJarBalanceLoading,
  } = useReadContract({
    contract,
    method: "function getBalance() view returns (uint256)",
  });

  // Read owner
  const { data: owner, isLoading: isOwnerLoading } = useReadContract({
    contract,
    method: "function owner() view returns (address)",
  });

  // Prepare transactions
  const sendTipTx = prepareContractCall({
    contract,
    method: "function sendTip() payable",
    params: [],
    overrides: {
      value: ethers.parseEther("0.001"),
    },
  });

  const withdrawTipsTx = prepareContractCall({
    contract,
    method: "function withdrawTips()",
    params: [],
  });

  return (
    <div className={styles.container}>
      <HeroCard
        isLoading={!metadata}
        title={metadata?.name || ""}
        description={metadata?.description || ""}
        image={metadata?.image}
      />
      <div className={styles.grid}>
        <div className={styles.componentCard}>
          <h3>Leave a Tip</h3>
          <p>Tip in MATIC and record it on the blockchain.</p>
          <TransactionButton transaction={() => sendTipTx}>
            Tip (0.001 MATIC)
          </TransactionButton>
        </div>
        <div className={styles.componentCard}>
          <h3>Tip Jar Balance</h3>
          {isTipJarBalanceLoading ? (
            <p>Loading balance...</p>
          ) : (
            <p>
              Balance: {tipJarBalance ? formatEther(tipJarBalance) : "0"}
            </p>
          )}
        </div>
        <div className={styles.componentCard}>
          <h3>Withdraw Balance</h3>
          {isOwnerLoading ? (
            <p>Loading owner...</p>
          ) : owner &&
            owner.toLowerCase() === address?.toLowerCase() ? (
            <TransactionButton
              transaction={() => withdrawTipsTx}
              onTransactionConfirmed={() => alert("Balance withdrawn!")}
            >
              Withdraw Balance
            </TransactionButton>
          ) : (
            <p>Only the owner can withdraw the balance.</p>
          )}
        </div>
      </div>
    </div>
  );
}
