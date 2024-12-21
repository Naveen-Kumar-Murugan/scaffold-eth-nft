"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Button } from "flowbite-react";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { Card } from "flowbite-react";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <h1>Hi</h1>
      <div>
        <Button>Click me</Button>
        <Card href="#" className="max-w-sm">
        <h5 className="text-2xl font-bold tracking-tight bg-primary">
          Noteworthy technology acquisitions 2021
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
        </p>
        </Card>
      </div>
    </>
  );
};

export default Home;
