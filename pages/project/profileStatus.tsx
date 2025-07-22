import React, { useState, useEffect } from "react";
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
  const [tipAmount, setTipAmount] = useState("1");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Get contract instance
  const contract = getContract({
    client,
    chain: primordialTestnet, // Your BlockDAG Primordial Testnet
    address: TIP_JAR_CONTRACT_ADDRESS,
  });

  // Read contract metadata (contractURI)
  const { data: contractURI } = useReadContract({
    contract,
    method: "function contractURI() view returns (string)",
  });

  // Fetch metadata from contractURI
  useEffect(() => {
    if (contractURI && typeof contractURI === "string") {
      let uri = contractURI;
      if (uri.startsWith("ipfs://")) {
        uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
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
  const { data: owner, isLoading: isOwnerLoading } = useReadContract({
    contract,
    method: "function owner() view returns (address)",
  });

  // Prepare transactions - FIXED: Using ThirdWeb's toWei
  const sendTipTx = prepareContractCall({
    contract,
    method: "function sendTip() payable",
    params: [],
    overrides: {
      value: toWei(tipAmount), // Fixed: Using ThirdWeb's toWei instead of ethers.parseEther
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
          <h3>🌌 Support Trekers MetaVerse</h3>
          <p>Leave a tip in BDAG and record it on the BlockDAG blockchain.</p>
          
          <div className={styles.inputGroup}>
            <label htmlFor="tipAmount" className={styles.label}>
              Tip Amount (BDAG):
            </label>
            <input
              id="tipAmount"
              type="number"
              step="1"
              min="1"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="1"
              className={styles.tipInput}
            />
          </div>
          
          <TransactionButton 
            transaction={() => sendTipTx}
            onTransactionConfirmed={() => 
              alert(`🚀 Thank you for supporting Trekers MetaVerse with ${tipAmount} BDAG!`)
            }
            onError={() => 
              alert("Transaction failed. Please try again.")
            }
          >
            {`💎 Tip ${tipAmount} BDAG`}
          </TransactionButton>
        </div>

        {/* Balance Display */}
        <div className={styles.componentCard}>
          <h3>🏦 MetaVerse Treasury Balance</h3>
          {isTipJarBalanceLoading ? (
            <div className={styles.loadingState}>
              <p>Loading treasury balance...</p>
            </div>
          ) : (
            <div className={styles.balanceSection}>
              <p className={styles.balanceAmount}>
                <strong>Balance: {tipJarBalance ? formatEther(tipJarBalance) : "0"} BDAG</strong>
              </p>
              <small className={styles.balanceSubtext}>
                Total community contributions received
              </small>
              <div className={styles.explorerLink}>
                <a 
                  href={`https://primordial.bdagscan.com/address/${TIP_JAR_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkButton}
                >
                  🔍 View on Primordial Explorer
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Withdraw Section */}
        <div className={styles.componentCard}>
          <h3>⚡ Treasury Management</h3>
          {isOwnerLoading ? (
            <p>Checking treasury permissions...</p>
          ) : isOwner ? (
            <div className={styles.ownerSection}>
              <p className={styles.ownerStatus}>✅ You are the treasury manager</p>
              <TransactionButton
                transaction={() => withdrawTipsTx}
                onTransactionSent={() => setIsWithdrawing(true)}
                onTransactionConfirmed={() => {
                  setIsWithdrawing(false);
                  alert("🎉 Treasury funds withdrawn successfully!");
                }}
                onError={() => {
                  setIsWithdrawing(false);
                  alert("❌ Withdrawal failed. Please try again.");
                }}
                disabled={isWithdrawing || !tipJarBalance || tipJarBalance === 0n}
              >
                {isWithdrawing 
                  ? "🔄 Processing Withdrawal..." 
                  : "💰 Withdraw Treasury"
                }
              </TransactionButton>
            </div>
          ) : (
            <div className={styles.restrictedAccess}>
              <p>🔒 Only the project owner can manage treasury funds.</p>
              {address && (
                <small>Your address: {address.slice(0, 6)}...{address.slice(-4)}</small>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Network & Project Info */}
      <div className={styles.networkInfo}>
        <div className={styles.infoGrid}>
          <div className={styles.networkCard}>
            <h4>🌐 Network</h4>
            <p><strong>BlockDAG Primordial Testnet</strong></p>
            <p>Chain ID: 1043</p>
          </div>
          <div className={styles.explorerCard}>
            <h4>🔗 Block Explorer</h4>
            <a 
              href="https://primordial.bdagscan.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.explorerButton}
            >
              primordial.bdagscan.com
            </a>
          </div>
          <div className={styles.projectCard}>
            <h4>🚀 Project</h4>
            <p><strong>Trekers MetaVerse Marketplace</strong></p>
            <a 
              href="https://github.com/Crusherbolt/Trekers-MetaVerse-Marketplace" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
