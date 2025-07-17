import React from "react";
import {
  useActiveAccount,
  TransactionButton,
  useReadContract,
} from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
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

  // Read total supply (for all tokens)
  const {
    data: totalSupply,
    isLoading: isTotalSupplyLoading,
  } = useReadContract({
    contract,
    method: "function totalSupply() view returns (uint256)",
  });

  // Read circulating supply for token ID 0
  const {
    data: totalClaimedSupply,
    isLoading: isTotalClaimedSupplyLoading,
  } = useReadContract({
    contract,
    method:
      "function totalSupply(uint256) view returns (uint256)",
    params: [0],
  });

  // Read owned NFTs (balanceOf for token ID 0)
  const {
    data: ownedBalance,
    isLoading: isOwnedNFTsLoading,
  } = useReadContract({
    contract,
    method:
      "function balanceOf(address, uint256) view returns (uint256)",
    params: [address, 0],
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
          <h3>Claim ERC-1155</h3>
          <p>Claim an ERC-1155 NFT for FREE!</p>
          <TransactionButton
            transaction={() =>
              prepareContractCall({
                contract,
                method:
                  "function mint(address to, uint256 id, uint256 amount, bytes data)",
                params: [address, 0, 1, "0x"], // Adjust method and params for your contract
              })
            }
          >
            Claim NFT
          </TransactionButton>
        </div>
        <div className={styles.componentCard}>
          <h3>Contract Stats</h3>
          <p>
            Total Amount of Tokens:
            {isTotalSupplyLoading
              ? "Loading supply..."
              : ` ${totalSupply?.toString()}`}
          </p>
          <p>
            Total Token ID #0:
            {isTotalClaimedSupplyLoading
              ? "Loading claimed..."
              : ` ${totalClaimedSupply?.toString()}`}
          </p>
        </div>
        <div className={styles.componentCard}>
          <h3>Your NFTs</h3>
          {isOwnedNFTsLoading ? (
            <p>Loading...</p>
          ) : ownedBalance && ownedBalance > 0 ? (
            <p>Token ID#0: {ownedBalance.toString()}</p>
          ) : (
            <p>No NFTs owned.</p>
          )}
        </div>
      </div>
    </div>
  );
}
