"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {create} from "ipfs-http-client";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { NFTCard } from "./NFTCard";

const PROJECT_ID = "2GajDLTC6y04qsYsoDRq9nGmWwK";
const PROJECT_SECRET = "48c62c6b3f82d2ecfa2cbe4c90f97037";
const PROJECT_ID_SECRECT = `${PROJECT_ID}:${PROJECT_SECRET}`;

export const ipfsClient = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    Authorization: `Basic ${Buffer.from(PROJECT_ID_SECRECT).toString("base64")}`,
  },
});

export interface Collectible {
    id: number;
    uri: string;
    owner: string;
  }

export async function getNFTMetadataFromIPFS(ipfsHash: string) {
    for await (const file of ipfsClient.get(ipfsHash)) {
      // The file is of type unit8array so we need to convert it to string
      const content = new TextDecoder().decode(file);
      // Remove any leading/trailing whitespace
      const trimmedContent = content.trim();
      // Find the start and end index of the JSON object
      const startIndex = trimmedContent.indexOf("{");
      const endIndex = trimmedContent.lastIndexOf("}") + 1;
      // Extract the JSON object string
      const jsonObjectString = trimmedContent.slice(startIndex, endIndex);
      try {
        const jsonObject = JSON.parse(jsonObjectString);
        return jsonObject;
      } catch (error) {
        console.log("Error parsing JSON:", error);
        return undefined;
      }
    }
  }
// export interface Collectible extends Partial<NFTMetaData> {
//   id: number;
//   uri: string;
//   owner: string;
// }

export const MyHoldings = () => {
  const { address: connectedAddress } = useAccount();
  const [myAllCollectibles, setMyAllCollectibles] = useState<Collectible[]>([]);
  const [allCollectiblesLoading, setAllCollectiblesLoading] = useState(false);

  const { data: yourCollectibleContract } = useScaffoldContract({
    contractName: "Murphy",
  });

  const { data: myTotalBalance } = useScaffoldReadContract({
    contractName: "Murphy",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true,
  });

  useEffect(() => {
    const updateMyCollectibles = async (): Promise<void> => {
      if (myTotalBalance === undefined || yourCollectibleContract === undefined || connectedAddress === undefined)
        return;

      setAllCollectiblesLoading(true);
      const collectibleUpdate: Collectible[] = [];
      const totalBalance = parseInt(myTotalBalance.toString());
      for (let tokenIndex = 0; tokenIndex < totalBalance; tokenIndex++) {
        try {
          const tokenId = await yourCollectibleContract.read.tokenOfOwnerByIndex([
            connectedAddress,
            BigInt(tokenIndex),
          ]);

          const tokenURI = await yourCollectibleContract.read.tokenURI([tokenId]);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/0xhttps://ipfs.io/ipfs/", "");

          const nftMetadata = await getNFTMetadataFromIPFS(ipfsHash);

          collectibleUpdate.push({
            id: parseInt(tokenId.toString()),
            uri: tokenURI,
            owner: connectedAddress,
            ...nftMetadata,
          });
        } catch (e) {
          notification.error("Error fetching all collectibles");
          setAllCollectiblesLoading(false);
          console.log(e);
        }
      }
      collectibleUpdate.sort((a, b) => a.id - b.id);
      setMyAllCollectibles(collectibleUpdate);
      setAllCollectiblesLoading(false);
    };

    updateMyCollectibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, myTotalBalance]);

  if (allCollectiblesLoading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <>
      {myAllCollectibles.length === 0 ? (
        <div className="flex justify-center items-center mt-10">
          <div className="text-2xl text-primary-content">No NFTs found</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
          {myAllCollectibles.map(item => (
            <NFTCard nft={item} key={item.id} />
          ))}
        </div>
      )}
    </>
  );
};
