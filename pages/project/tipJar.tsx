import React, { useState } from "react";
import {
  useActiveAccount,
  TransactionButton,
  useReadContract,
} from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { formatEther } from "ethers";
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
  
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState("0.001");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Get contract instance
  const contract = getContract({
    client,
    chain: primordialTestnet, // Using your custom BlockDAG testnet
    address: TIP_JAR_CONTRACT_ADDRESS,
  });

  // Read contract metadata (contractURI)
  const { data: contractURI } = useReadContract({
    contract,
    method: "function contractURI() view returns (string)",
  });

  // Fetch metadata from contractURI
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
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch metadata');
          return res.json();
        })
        .then(setMetadata)
        .catch((err) => {
          console.error('Metadata fetch error:', err);
          setError('Failed to load project metadata');
          setMetadata(null);
        });
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
  const { data: owner, isLoading: isOwnerLoading } =
    useReadContract({
      contract,
      method: "function owner() view returns (address)",
    });

  // Prepare transactions - Using ThirdWeb's toWei for BDAG
  const sendTipTx = prepareContractCall({
    contract,
    method: "function sendTip() payable",
    params: [],
    overrides: {
      value: toWei(tipAmount), // This will work with BDAG tokens
    },
  });

  const withdrawTipsTx = prepareContractCall({
    contract,
    method: "function withdrawTips()",
    params: [],
  });

  const isOwner = owner && owner.toLowerCase() === address?.toLowerCase();

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <HeroCard
        isLoading={!metadata}
        title={metadata?.name || "Trekers MetaVerse Tip Jar"}
        description={metadata?.description || "Support the Trekers MetaVerse with BDAG tips"}
        image={metadata?.image}
      />
      
      <div className={styles.grid}>
        {/* Tip Section */}
        <div className={styles.componentCard}>
          <h3>🚀 Support Trekers MetaVerse</h3>
          <p>Tip in BDAG and record it on the BlockDAG Primordial Testnet.</p>
          
          <div className={styles.inputGroup}>
            <label htmlFor="tipAmount">Amount (BDAG):</label>
            <input
              id="tipAmount"
              type="number"
              step="0.001"
              min="0.001"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="0.001"
              className={styles.amountInput}
            />
          </div>
          
          <TransactionButton 
            transaction={() => sendTipTx}
            onTransactionConfirmed={() => 
              alert(`Thank you for supporting Trekers MetaVerse with ${tipAmount} BDAG!`)
            }
          >
            {`Tip ${tipAmount} BDAG`}
          </TransactionButton>
        </div>

        {/* Balance Display */}
        <div className={styles.componentCard}>
          <h3>💎 MetaVerse Treasury</h3>
          {isTipJarBalanceLoading ? (
            <p>Loading treasury balance...</p>
          ) : (
            <div className={styles.balanceDisplay}>
              <p className={styles.balanceAmount}>
                Balance:{" "}
                {tipJarBalance
                  ? formatEther(tipJarBalance)
                  : "0"}{" "}
                BDAG
              </p>
              <small>Total community support received</small>
              <br />
              <small>
                <a 
                  href={`https://primordial.bdagscan.com/address/${TIP_JAR_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Primordial Explorer 🔍
                </a>
              </small>
            </div>
          )}
        </div>

        {/* Withdraw Section */}
        <div className={styles.componentCard}>
          <h3>🏛️ Treasury Management</h3>
          {isOwnerLoading ? (
            <p>Checking permissions...</p>
          ) : isOwner ? (
            <div>
              <p>✅ You are the treasury manager</p>
              <TransactionButton
                transaction={() => withdrawTipsTx}
                onTransactionSent={() => setIsWithdrawing(true)}
                onTransactionConfirmed={() => {
                  setIsWithdrawing(false);
                  alert("Treasury funds withdrawn successfully!");
                }}
                onError={() => setIsWithdrawing(false)}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? "Processing withdrawal..." : "Withdraw Treasury"}
              </TransactionButton>
            </div>
          ) : (
            <p>🔒 Only the project owner can manage treasury funds.</p>
          )}
        </div>
      </div>
      
      {/* Network Info */}
      <div className={styles.networkInfo}>
        <p>
          🌐 Connected to: <strong>BlockDAG Primordial Testnet</strong> (Chain ID: 1043)
        </p>
        <p>
          🔗 Explorer: <a 
            href="https://primordial.bdagscan.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            primordial.bdagscan.com
          </a>
        </p>
      </div>
    </div>
  );
}
