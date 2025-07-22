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
  const [availableNFTs, setAvailableNFTs] = useState<any[]>([]);
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
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

  // Read total supply
  const { data: totalSupply, isLoading: isTotalSupplyLoading } = useReadContract({
    contract,
    method: "function totalSupply() view returns (uint256)",
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
        });
    }
  }, [contractURI]);

  // Fetch available NFTs and user's NFTs
  useEffect(() => {
    const fetchNFTData = async () => {
      if (!address) return;

      try {
        setLoading(true);
        const nftData = [];
        const userNftData = [];

        // Fetch data for multiple token IDs (adjust range based on your collection)
        for (let tokenId = 0; tokenId < 10; tokenId++) { // Checking first 10 token IDs
          try {
            // Check if token exists by checking total supply
            const tokenSupply = await useReadContract({
              contract,
              method: "function totalSupply(uint256) view returns (uint256)",
              params: [BigInt(tokenId)],
            });

            if (tokenSupply && tokenSupply > 0) {
              // Get user balance for this token
              const userBalance = await useReadContract({
                contract,
                method: "function balanceOf(address, uint256) view returns (uint256)",
                params: [address, BigInt(tokenId)],
              });

              // Get token URI for metadata
              const tokenURI = await useReadContract({
                contract,
                method: "function uri(uint256) view returns (string)",
                params: [BigInt(tokenId)],
              });

              // Get price if your contract has pricing function
              let price = "0.001"; // Default price in BDAG
              try {
                const tokenPrice = await useReadContract({
                  contract,
                  method: "function getPrice(uint256) view returns (uint256)",
                  params: [BigInt(tokenId)],
                });
                if (tokenPrice) {
                  price = formatEther(tokenPrice);
                }
              } catch (priceError) {
                // If no pricing function, use default
                console.log(`No price function for token ${tokenId}, using default`);
              }

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
                  console.error(`Failed to fetch metadata for token ${tokenId}:`, metadataError);
                }
              }

              const nftInfo = {
                tokenId: tokenId.toString(),
                supply: tokenSupply.toString(),
                price: price,
                metadata: tokenMetadata,
                name: tokenMetadata?.name || `NFT #${tokenId}`,
                description: tokenMetadata?.description || "Trekers MetaVerse NFT",
                image: tokenMetadata?.image || "/placeholder-nft.png",
                userBalance: userBalance ? userBalance.toString() : "0",
              };

              // Add to available NFTs
              nftData.push(nftInfo);

              // Add to user NFTs if they own any
              if (userBalance && userBalance > 0) {
                userNftData.push(nftInfo);
              }
            }
          } catch (tokenError) {
            // Token doesn't exist or error fetching, skip
            continue;
          }
        }

        setAvailableNFTs(nftData);
        setUserNFTs(userNftData);
      } catch (error) {
        console.error('Error fetching NFT data:', error);
        setError('Failed to load NFT data');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, [address, contract]);

  // Purchase NFT function
  const buyNFT = (tokenId: string, price: string) => {
    return prepareContractCall({
      contract,
      method: "function mint(address to, uint256 id, uint256 amount, bytes data)",
      params: [address, BigInt(tokenId), 1n, "0x"],
      overrides: {
        value: toWei(price), // Send BDAG payment
      },
    });
  };

  // Free claim function
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
        {/* Collection Stats */}
        <div className={styles.componentCard}>
          <h3>📊 Collection Stats</h3>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total Tokens:</span>
              <span className={styles.statValue}>
                {isTotalSupplyLoading ? "Loading..." : totalSupply?.toString() || "0"}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Available NFTs:</span>
              <span className={styles.statValue}>{availableNFTs.length}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>You Own:</span>
              <span className={styles.statValue}>{userNFTs.length} NFTs</span>
            </div>
          </div>
        </div>

        {/* Your NFTs */}
        <div className={styles.componentCard}>
          <h3>🎭 Your NFT Collection</h3>
          {loading ? (
            <p>Loading your NFTs...</p>
          ) : userNFTs.length > 0 ? (
            <div className={styles.nftGrid}>
              {userNFTs.map((nft) => (
                <div key={nft.tokenId} className={styles.ownedNFT}>
                  <img 
                    src={nft.image} 
                    alt={nft.name}
                    className={styles.nftImage}
                  />
                  <div className={styles.nftInfo}>
                    <h4>{nft.name}</h4>
                    <p>ID: #{nft.tokenId}</p>
                    <p>Owned: {nft.userBalance}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noNFTs}>
              <p>🤷‍♂️ You don't own any NFTs yet</p>
              <small>Browse available NFTs below to start collecting!</small>
            </div>
          )}
        </div>
      </div>

      {/* Available NFTs for Purchase */}
      <div className={styles.marketplace}>
        <h2>🛒 NFT Marketplace</h2>
        <p>Discover and collect unique Trekers MetaVerse NFTs</p>
        
        {loading ? (
          <div className={styles.loading}>
            <p>🔄 Loading available NFTs...</p>
          </div>
        ) : availableNFTs.length > 0 ? (
          <div className={styles.nftMarketplace}>
            {availableNFTs.map((nft) => (
              <div key={nft.tokenId} className={styles.nftCard}>
                <div className={styles.nftImageContainer}>
                  <img 
                    src={nft.image} 
                    alt={nft.name}
                    className={styles.marketplaceNftImage}
                  />
                  {nft.userBalance > 0 && (
                    <div className={styles.ownedBadge}>✅ Owned</div>
                  )}
                </div>
                
                <div className={styles.nftDetails}>
                  <h3>{nft.name}</h3>
                  <p className={styles.nftDescription}>{nft.description}</p>
                  
                  <div className={styles.nftStats}>
                    <span>🆔 ID: #{nft.tokenId}</span>
                    <span>📦 Supply: {nft.supply}</span>
                    <span>💰 {nft.price} BDAG</span>
                  </div>

                  <div className={styles.nftActions}>
                    {parseFloat(nft.price) === 0 ? (
                      <TransactionButton
                        transaction={() => claimFreeNFT(nft.tokenId)}
                        onTransactionConfirmed={() => 
                          alert(`🎉 Successfully claimed ${nft.name}!`)
                        }
                      >
                        🎁 Claim Free
                      </TransactionButton>
                    ) : (
                      <TransactionButton
                        transaction={() => buyNFT(nft.tokenId, nft.price)}
                        onTransactionConfirmed={() => 
                          alert(`🎊 Successfully purchased ${nft.name}!`)
                        }
                      >
                        💎 Buy for {nft.price} BDAG
                      </TransactionButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noMarketplace}>
            <p>📭 No NFTs available in the marketplace</p>
            <small>Check back later for new drops!</small>
          </div>
        )}
      </div>

      {/* Network Info */}
      <div className={styles.networkInfo}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h4>🌐 Network</h4>
            <p><strong>BlockDAG Primordial Testnet</strong></p>
            <p>Chain ID: 1043</p>
          </div>
          <div className={styles.infoCard}>
            <h4>🔗 Contract</h4>
            <p>
              <code>{ERC1155_CONTRACT_ADDRESS.slice(0, 6)}...{ERC1155_CONTRACT_ADDRESS.slice(-4)}</code>
            </p>
            <a 
              href={`https://primordial.bdagscan.com/address/${ERC1155_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.explorerLink}
            >
              🔍 View on Explorer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
