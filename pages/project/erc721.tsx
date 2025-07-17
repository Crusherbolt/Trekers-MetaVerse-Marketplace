import React from "react";
import {
  useActiveAccount,
  TransactionButton,
  useReadContract,
  MediaRenderer,
} from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import HeroCard from "../../components/hero-card";
import { ERC721_CONTRACT_ADDRESS } from "../../const/addresses";
import styles from "../../styles/Home.module.css";
import Link from "next/link";
import {
  client,
  primordialTestnet,
} from "../../lib/client";

export default function ERC721Project() {
  const account = useActiveAccount();
  const address = account?.address;

  // Get contract instance
  const contract = getContract({
    client,
    chain: primordialTestnet,
    address: ERC721_CONTRACT_ADDRESS,
  });

  // Read contract metadata (contractURI)
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
    isLoading: isTotalSupplyLoading,
  } = useReadContract({
    contract,
    method: "function totalSupply() view returns (uint256)",
  });

  // Read total claimed (if your contract has a claimed count, otherwise skip)
  // For standard ERC721, you may not have claimed count. If you do, use the correct method.

  // Read owned NFTs (token IDs)
  const {
    data: ownedTokenIds,
    isLoading: isOwnedNFTsLoading,
  } = useReadContract({
    contract,
    method:
      "function tokensOfOwner(address) view returns (uint256[])",
    params: [address],
  });

  // Fetch metadata for each owned NFT
  const [ownedNFTs, setOwnedNFTs] = React.useState<any[]>(
    [],
  );
  React.useEffect(() => {
    async function fetchNFTs() {
      if (ownedTokenIds && Array.isArray(ownedTokenIds)) {
        const nfts = await Promise.all(
          ownedTokenIds.map(async (tokenId: any) => {
            const { data: tokenURI } = await contract.read({
              method:
                "function tokenURI(uint256) view returns (string)",
              params: [tokenId],
            });
            let uri = tokenURI;
            if (
              uri &&
              typeof uri === "string" &&
              uri.startsWith("ipfs://")
            ) {
              uri = uri.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/",
              );
            }
            const meta = await fetch(uri).then((res) =>
              res.json(),
            );
            return { tokenId, metadata: meta };
          }),
        );
        setOwnedNFTs(nfts);
      }
    }
    fetchNFTs();
  }, [ownedTokenIds, contract]);

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
          <h3>Claim ERC-721</h3>
          <p>Claim an ERC-721 NFT for FREE!</p>
          <TransactionButton
            transaction={() =>
              prepareContractCall({
                contract,
                method:
                  "function mint(address to, uint256 amount)",
                params: [address, 1n], // Adjust method and params for your contract
              })
            }
          >
            Claim NFT
          </TransactionButton>
        </div>
        <div className={styles.componentCard}>
          <h3>Contract Stats</h3>
          <p>
            Total Supply:
            {isTotalSupplyLoading
              ? "Loading supply..."
              : ` ${totalSupply?.toString()}`}
          </p>
        </div>
        <div className={styles.componentCard}>
          <h3>Your NFTs</h3>
          <p>
            Total Owned:
            {isOwnedNFTsLoading
              ? "Loading owned..."
              : ` ${ownedNFTs?.length}`}
          </p>
        </div>
      </div>
      <div className={styles.container}>
        <h2>My NFTs:</h2>
        <div
          className={styles.grid}
          style={{ justifyContent: "flex-start" }}
        >
          {isOwnedNFTsLoading ? (
            <p>Loading NFTs...</p>
          ) : ownedNFTs && ownedNFTs.length > 0 ? (
            ownedNFTs.map((nft) => (
              <div
                className={styles.card}
                key={nft.tokenId}
              >
                <MediaRenderer src={nft.metadata.image} />
                <div className={styles.cardText}>
                  <h2>{nft.metadata.name}</h2>
                </div>
                <Link href="/project/staking">
                  <button
                    className={styles.matchButton}
                    style={{
                      width: "100%",
                      borderRadius: "0 0 8px 8px",
                    }}
                  >
                    Stake NFT
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <p>No NFTs owned.</p>
          )}
        </div>
      </div>
    </div>
  );
}
