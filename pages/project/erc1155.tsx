import React, { useState, useEffect } from "react";
import {
  useActiveAccount,
  TransactionButton,
  useReadContract,
} from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { formatEther } from "ethers";
import HeroCard from "../../components/hero-card";
import { ERC1155_CONTRACT_ADDRESS } from "../../const/addresses";
import styles from "../../styles/Home.module.css";
import {
  client,
  primordialTestnet,
} from "../../lib/client";

export default function ERC1155Project() {
  const account = useActiveAccount();
  const address = account?.address;
  
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableTokens, setAvailableTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get contract instance
  const contract = getContract({
    client,
    chain: primordialTestnet,
    address: ERC1155_CONTRACT_ADDRESS,
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
          setError('Failed to load collection metadata');
          setMetadata(null);
        });
    }
  }, [contractURI]);

  // Fetch NFT data for known token IDs
  useEffect(() => {
    const fetchNFTData = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const tokenData = [];
        
        // Check token IDs 0-20 (you can adjust this range)
        const tokenIdsToCheck = Array.from({length: 21}, (_, i) => i);
        
        for (const tokenId of tokenIdsToCheck) {
          try {
            // Get user balance for this token
            const userBalance = await getUserBalance(tokenId);
            
            // Get token URI
            const tokenURI = await getTokenURI(tokenId);
            
            if (tokenURI || userBalance > 0) {
              // Fetch token metadata
              let tokenMetadata = null;
              if (tokenURI) {
                try {
                  let uri = tokenURI;
                  if (uri.startsWith("ipfs://")) {
                    uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
                  }
                  const response = await fetch(uri);
                  if (response.ok) {
                    tokenMetadata = await response.json();
                  }
                } catch (metadataError) {
                  console.log(`Could not fetch metadata for token ${tokenId}`);
                }
              }

              const tokenInfo = {
                tokenId: tokenId.toString(),
                userBalance: userBalance.toString(),
                metadata: tokenMetadata,
                name: tokenMetadata?.name || `Trekers NFT #${tokenId}`,
                description: tokenMetadata?.description || "Trekers MetaVerse Collectible",
                image: tokenMetadata?.image || "/placeholder-nft.png",
                uri: tokenURI,
              };

              tokenData.push(tokenInfo);
            }
          } catch (error) {
            // Skip this token ID if there's an error
            continue;
          }
        }

        setAvailableTokens(tokenData);
      } catch (error) {
        console.error('Error fetching NFT data:', error);
        setError('Failed to load NFT data');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, [address]);

  // Helper function to get user balance
  const getUserBalance = async (tokenId: number) => {
    try {
      const balance = await useReadContract({
        contract,
        method: "function balanceOf(address, uint256) view returns (uint256)",
        params: [address, BigInt(tokenId)],
      });
      return balance || 0n;
    } catch (error) {
      return 0n;
    }
  };

  // Helper function to get token URI
  const getTokenURI = async (tokenId: number) => {
    try {
      const uri = await useReadContract({
        contract,
        method: "function uri(uint256) view returns (string)",
        params: [BigInt(tokenId)],
      });
      return uri;
    } catch (error) {
      return null;
    }
  };

  // Individual token balance hooks for display
  const TokenBalance = ({ tokenId }: { tokenId: string }) => {
    const { data: balance, isLoading } = useReadContract({
      contract,
      method: "function balanceOf(address, uint256) view returns (uint256)",
      params: [address, BigInt(tokenId)],
    });

    if (isLoading) return <span>Loading...</span>;
    return <span>{balance?.toString() || "0"}</span>;
  };

  // Mint/Buy functions
  const mintNFT = (tokenId: string) => {
    return prepareContractCall({
      contract,
      method: "function mint(address to, uint256 id, uint256 amount, bytes data)",
      params: [address, BigInt(tokenId), 1n, "0x"],
      overrides: {
        value: toWei("0.001"), // 0.001 BDAG price
      },
    });
  };

  const claimFreeNFT = (tokenId: string) => {
    return prepareContractCall({
      contract,
      method: "function mint(address to, uint256 id, uint256 amount, bytes data)",
      params: [address, BigInt(tokenId), 1n, "0x"],
    });
  };

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
        title={metadata?.name || "Trekers MetaVerse NFT Collection"}
        description={metadata?.description || "Collect unique NFTs in the Trekers MetaVerse"}
        image={metadata?.image}
      />
      
      <div className={styles.grid}>
        {/* Quick Mint Section */}
        <div className={styles.componentCard}>
          <h3>🎁 Free Claim</h3>
          <p>Claim your first Trekers MetaVerse NFT for FREE!</p>
          <TransactionButton
            transaction={() => claimFreeNFT("0")}
            onTransactionConfirmed={() => 
              alert("🎉 Successfully claimed your NFT!")
            }
          >
            Claim NFT #0 (FREE)
          </TransactionButton>
        </div>

        {/* Buy NFT Section */}
        <div className={styles.componentCard}>
          <h3>💎 Buy Premium NFT</h3>
          <p>Purchase premium NFTs with BDAG tokens!</p>
          <TransactionButton
            transaction={() => mintNFT("1")}
            onTransactionConfirmed={() => 
              alert("🎊 Successfully purchased premium NFT!")
            }
          >
            Buy NFT #1 (0.001 BDAG)
          </TransactionButton>
        </div>

        {/* Your Collection Stats */}
        <div className={styles.componentCard}>
          <h3>📊 Your Collection</h3>
          <div className={styles.collectionStats}>
            <div className={styles.statItem}>
              <span>NFT #0:</span>
              <TokenBalance tokenId="0" />
            </div>
            <div className={styles.statItem}>
              <span>NFT #1:</span>
              <TokenBalance tokenId="1" />
            </div>
            <div className={styles.statItem}>
              <span>NFT #2:</span>
              <TokenBalance tokenId="2" />
            </div>
          </div>
        </div>
      </div>

      {/* NFT Gallery */}
      <div className={styles.nftGallery}>
        <h2>🖼️ Available NFTs</h2>
        {loading ? (
          <div className={styles.loading}>
            <p>🔄 Loading NFT collection...</p>
          </div>
        ) : availableTokens.length > 0 ? (
          <div className={styles.nftGrid}>
            {availableTokens.map((token) => (
              <div key={token.tokenId} className={styles.nftCard}>
                <div className={styles.nftImageContainer}>
                  <img 
                    src={token.image} 
                    alt={token.name}
                    className={styles.nftImage}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-nft.png";
                    }}
                  />
                  {parseInt(token.userBalance) > 0 && (
                    <div className={styles.ownedBadge}>
                      ✅ Owned: {token.userBalance}
                    </div>
                  )}
                </div>
                
                <div className={styles.nftDetails}>
                  <h3>{token.name}</h3>
                  <p className={styles.nftDescription}>{token.description}</p>
                  
                  <div className={styles.nftMeta}>
                    <span>🆔 Token ID: #{token.tokenId}</span>
                    <span>💼 You own: {token.userBalance}</span>
                  </div>

                  <div className={styles.nftActions}>
                    {token.tokenId === "0" ? (
                      <TransactionButton
                        transaction={() => claimFreeNFT(token.tokenId)}
                        onTransactionConfirmed={() => 
                          alert(`🎉 Successfully claimed ${token.name}!`)
                        }
                      >
                        🎁 Claim Free
                      </TransactionButton>
                    ) : (
                      <TransactionButton
                        transaction={() => mintNFT(token.tokenId)}
                        onTransactionConfirmed={() => 
                          alert(`🎊 Successfully purchased ${token.name}!`)
                        }
                      >
                        💎 Buy (0.001 BDAG)
                      </TransactionButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noNFTs}>
            <p>🤔 No NFTs found in this collection</p>
            <p>Try claiming the free NFT above to get started!</p>
          </div>
        )}
      </div>

      {/* Manual Token Check */}
      <div className={styles.manualCheck}>
        <h3>🔍 Check Specific Token</h3>
        <p>Enter a token ID to check if it exists:</p>
        <div className={styles.tokenChecker}>
          <input 
            type="number" 
            placeholder="Enter Token ID" 
            className={styles.tokenInput}
            onChange={(e) => {
              const tokenId = e.target.value;
              if (tokenId) {
                // You can add logic here to check specific token
                console.log(`Checking token ${tokenId}`);
              }
            }}
          />
        </div>
      </div>

      {/* Contract Info */}
      <div className={styles.contractInfo}>
        <h3>📋 Contract Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>Contract Address:</strong>
            <code>{ERC1155_CONTRACT_ADDRESS}</code>
          </div>
          <div className={styles.infoItem}>
            <strong>Network:</strong>
            <span>BlockDAG Primordial Testnet (Chain ID: 1043)</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Explorer:</strong>
            <a 
              href={`https://primordial.bdagscan.com/address/${ERC1155_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Primordial Explorer 🔍
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
