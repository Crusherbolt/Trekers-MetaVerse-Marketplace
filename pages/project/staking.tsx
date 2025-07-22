import React, { useState, useEffect } from "react";
import {
  useActiveAccount,
  TransactionButton,
  useReadContract,
} from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { formatEther } from "ethers";
import HeroCard from "../../components/hero-card";
import styles from "../../styles/Home.module.css";
import { 
  STAKING_CONTRACT_ADDRESS,
  ERC721_CONTRACT_ADDRESS,
  ERC20_CONTRACT_ADDRESS 
} from "../../const/addresses";
import Link from "next/link";
import {
  client,
  primordialTestnet,
} from "../../lib/client";

export default function StakingProject() {
  const account = useActiveAccount();
  const address = account?.address;
  
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [userNFTs, setUserNFTs] = useState<any[]>([]);

  // Get staking contract instance
  const stakingContract = getContract({
    client,
    chain: primordialTestnet,
    address: STAKING_CONTRACT_ADDRESS,
  });

  // Get ERC721 contract instance
  const nftContract = getContract({
    client,
    chain: primordialTestnet,
    address: ERC721_CONTRACT_ADDRESS,
  });

  // Get ERC20 contract instance
  const tokenContract = getContract({
    client,
    chain: primordialTestnet,
    address: ERC20_CONTRACT_ADDRESS,
  });

  // Read staking contract metadata
  const { data: contractURI } = useReadContract({
    contract: stakingContract,
    method: "function contractURI() view returns (string)",
  });

  // Read reward token symbol
  const { data: rewardTokenSymbol } = useReadContract({
    contract: tokenContract,
    method: "function symbol() view returns (string)",
  });

  // Read user's staked NFTs
  const { data: stakedTokens, isLoading: isStakedTokensLoading } = useReadContract({
    contract: stakingContract,
    method: "function getStakedTokens(address) view returns (uint256[])",
    params: [address],
  });

  // Read total staking rewards available
  const { data: availableRewards, isLoading: isRewardsLoading } = useReadContract({
    contract: stakingContract,
    method: "function getStakeInfo(address) view returns (uint256, uint256)",
    params: [address],
  });

  // Read user's NFT balance
  const { data: nftBalance } = useReadContract({
    contract: nftContract,
    method: "function balanceOf(address) view returns (uint256)",
    params: [address],
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
          setError('Failed to load staking metadata');
        });
    }
  }, [contractURI]);

  // Fetch user's NFTs for staking selection
  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (address && nftBalance && Number(nftBalance) > 0) {
        try {
          const nfts = [];
          for (let i = 0; i < Number(nftBalance); i++) {
            // This is a simplified approach - you might need to adjust based on your NFT contract
            const tokenId = await useReadContract({
              contract: nftContract,
              method: "function tokenOfOwnerByIndex(address, uint256) view returns (uint256)",
              params: [address, BigInt(i)],
            });
            if (tokenId) {
              nfts.push({ tokenId: tokenId.toString(), index: i });
            }
          }
          setUserNFTs(nfts);
        } catch (error) {
          console.error('Error fetching NFTs:', error);
        }
      }
    };

    fetchUserNFTs();
  }, [address, nftBalance]);

  // Prepare staking transaction
  const stakeNFTTx = prepareContractCall({
    contract: stakingContract,
    method: "function stake(uint256 tokenId)",
    params: [BigInt(selectedTokenId)],
  });

  // Prepare unstaking transaction
  const unstakeNFTTx = (tokenId: string) => prepareContractCall({
    contract: stakingContract,
    method: "function withdraw(uint256 tokenId)",
    params: [BigInt(tokenId)],
  });

  // Prepare claim rewards transaction
  const claimRewardsTx = prepareContractCall({
    contract: stakingContract,
    method: "function claimRewards()",
    params: [],
  });

  // Prepare approve NFT transaction
  const approveNFTTx = prepareContractCall({
    contract: nftContract,
    method: "function approve(address, uint256)",
    params: [STAKING_CONTRACT_ADDRESS, BigInt(selectedTokenId)],
  });

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
        title={metadata?.name || "Trekers MetaVerse Staking"}
        description={metadata?.description || "Stake your ERC-721 NFTs to earn rewards"}
        image={metadata?.image}
      />
      
      <div className={styles.grid}>
        {/* Staking Section */}
        <div className={styles.componentCard}>
          <h3>🎯 Stake ERC-721 NFTs</h3>
          <p>Stake your NFTs to earn {rewardTokenSymbol || "reward"} tokens!</p>
          
          {userNFTs.length > 0 ? (
            <div className={styles.stakingForm}>
              <label htmlFor="tokenSelect" className={styles.label}>
                Select NFT to Stake:
              </label>
              <select
                id="tokenSelect"
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                className={styles.tokenSelect}
              >
                <option value="">Choose an NFT...</option>
                {userNFTs.map((nft) => (
                  <option key={nft.tokenId} value={nft.tokenId}>
                    NFT #{nft.tokenId}
                  </option>
                ))}
              </select>
              
              <div className={styles.stakingButtons}>
                {selectedTokenId && (
                  <>
                    <TransactionButton
                      transaction={() => approveNFTTx}
                      onTransactionConfirmed={() => 
                        alert(`NFT #${selectedTokenId} approved for staking!`)
                      }
                    >
                      1. Approve NFT
                    </TransactionButton>
                    
                    <TransactionButton
                      transaction={() => stakeNFTTx}
                      onTransactionConfirmed={() => {
                        alert(`🎉 NFT #${selectedTokenId} staked successfully!`);
                        setSelectedTokenId("");
                      }}
                    >
                      2. Stake NFT #{selectedTokenId}
                    </TransactionButton>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.noNFTs}>
              <p>❌ You don't have any NFTs to stake.</p>
              <Link href="/project/nft" className={styles.mintLink}>
                <button className={styles.mintButton}>
                  🎨 Mint NFTs First
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Staked NFTs Section */}
        <div className={styles.componentCard}>
          <h3>🔒 Your Staked NFTs</h3>
          {isStakedTokensLoading ? (
            <p>Loading staked NFTs...</p>
          ) : stakedTokens && stakedTokens.length > 0 ? (
            <div className={styles.stakedNFTs}>
              <p>📊 Staked NFTs: {stakedTokens.length}</p>
              <div className={styles.nftGrid}>
                {stakedTokens.map((tokenId: any) => (
                  <div key={tokenId.toString()} className={styles.stakedNFT}>
                    <p>🎭 NFT #{tokenId.toString()}</p>
                    <TransactionButton
                      transaction={() => unstakeNFTTx(tokenId.toString())}
                      onTransactionConfirmed={() => 
                        alert(`🔓 NFT #${tokenId.toString()} unstaked!`)
                      }
                    >
                      Unstake
                    </TransactionButton>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.noStakedNFTs}>
              <p>📝 No NFTs currently staked</p>
              <small>Stake NFTs to start earning rewards!</small>
            </div>
          )}
        </div>

        {/* Rewards Section */}
        <div className={styles.componentCard}>
          <h3>💰 Staking Rewards</h3>
          {isRewardsLoading ? (
            <p>Loading rewards...</p>
          ) : (
            <div className={styles.rewardsSection}>
              <div className={styles.rewardsDisplay}>
                <p className={styles.rewardsAmount}>
                  💎 Available Rewards: {" "}
                  {availableRewards && availableRewards[1] 
                    ? formatEther(availableRewards[1])
                    : "0"
                  } {rewardTokenSymbol || "Tokens"}
                </p>
                <small>Rewards accumulate over time while staking</small>
              </div>
              
              <TransactionButton
                transaction={() => claimRewardsTx}
                onTransactionConfirmed={() => 
                  alert("🎊 Rewards claimed successfully!")
                }
                disabled={!availableRewards || availableRewards[1] === 0n}
              >
                🏆 Claim Rewards
              </TransactionButton>
            </div>
          )}
        </div>
      </div>

      {/* Staking Info */}
      <div className={styles.stakingInfo}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h4>📈 How Staking Works</h4>
            <ul>
              <li>✅ Stake your ERC-721 NFTs</li>
              <li>🕐 Earn rewards over time</li>
              <li>💰 Claim rewards anytime</li>
              <li>🔓 Unstake NFTs when you want</li>
            </ul>
          </div>
          
          <div className={styles.infoCard}>
            <h4>🔗 Contract Addresses</h4>
            <p>
              <small>
                Staking: <code>{STAKING_CONTRACT_ADDRESS.slice(0, 6)}...{STAKING_CONTRACT_ADDRESS.slice(-4)}</code>
              </small>
            </p>
            <a 
              href={`https://primordial.bdagscan.com/address/${STAKING_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.explorerLink}
            >
              🔍 View on Explorer
            </a>
          </div>

          <div className={styles.infoCard}>
            <h4>🌐 Network</h4>
            <p><strong>BlockDAG Primordial Testnet</strong></p>
            <p>Chain ID: 1043</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <Link href="/project/erc20" className={styles.navButton}>
          ← Back to ERC-20 Tokens
        </Link>
        <Link href="/project/nft" className={styles.navButton}>
          🎨 View NFT Collection →
        </Link>
      </div>
    </div>
  );
}
