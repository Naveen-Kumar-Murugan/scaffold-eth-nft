"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {create} from "ipfs-http-client";
import { Button, Label, TextInput } from "flowbite-react";
import { notification } from "~~/utils/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useState } from "react";


const projectId = '2GajDLTC6y04qsYsoDRq9nGmWwK'; // Replace with your Project ID
const projectSecret = '48c62c6b3f82d2ecfa2cbe4c90f97037'; // Replace with your Project Secret
const auth = 'Basic ' + Buffer.from(`${projectId}:${projectSecret}`).toString('base64');

// Connect to Infura IPFS
const client = create({
  url: 'https://ipfs.infura.io:5001',
  headers: {
      authorization: auth,
  },
});

const MintNFT: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [yourJSON, setYourJSON] = useState<object>();
  const [loading, setLoading] = useState(false);
  const [uploadedIpfsPath, setUploadedIpfsPath] = useState("");

  const { writeContractAsync } = useScaffoldWriteContract("Murphy");


    const handleImageUpload = async (event) => {
      setLoading(true);
      const file = event.target.files[0];
      if (!file) {
          return;
      }
      const notificationId = notification.loading("Uploading Image to IPFS...");
      try {
          const result = await client.add(file);
          const url = `https://ipfs.io/ipfs/${result.cid}`;
          setUploadedIpfsPath(url);
          setYourJSON(prevState => ({...prevState,url:url}));
          notification.remove(notificationId);
          notification.success('Image uploaded to IPFS: ' + url);
      } catch (error) {
        notification.remove(notificationId);
        notification.error("Error uploading Image to IPFS");
        console.log(error);
      } finally {
        setLoading(false);
      }
  };

    const handleIpfsUpload = async (event) => {
      event.preventDefault()
      if (!uploadedIpfsPath) {
        notification.error('Please upload NFT image!!');
        return;
      }
      setLoading(true);
      const notificationId = notification.loading("Uploading to IPFS...");
      try {
        const result = await client.add(JSON.stringify(yourJSON));
        const url = `https://ipfs.io/ipfs/${result.cid}`;
        notification.remove(notificationId);
        notification.success("Uploaded to IPFS");
        console.log(`The Metadate is uploaded to IPFS and the url is ${url}`);
        
        await writeContractAsync({
          functionName: "mintItem",
          args: [connectedAddress, `0x${url}`],
        });
        notification.remove(notificationId);
        notification.success("NFT Minted");

      } catch (error) {
        notification.remove(notificationId);
        notification.error("Error uploading to IPFS");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      <div className=" justify-center mx-auto w-72 my-auto">
        <form className="flex w-auto flex-col gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="name" value="Name of NFT" />
            </div>
            <TextInput id="name" type="text" placeholder="Buffalo" onChange={(e)=>setYourJSON(prevState => ({ ...prevState,name:e.target.value}))} required />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="description" value="NFT description" />
              </div>
              <TextInput id="description" type="text" onChange={(e)=>setYourJSON(prevState => ({ ...prevState,description:e.target.value}))} required />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="upload image" value="Upload Image: " />
              </div>
              <TextInput id="image" type="file" required onChange={handleImageUpload} />
            </div>
            <Button type="submit" onClick={handleIpfsUpload}>Submit</Button>
        </form>
      </div>
    </>
  );
};

export default MintNFT;