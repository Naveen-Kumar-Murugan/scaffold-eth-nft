"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Button } from "flowbite-react";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { Card } from "flowbite-react";
import { MyHoldings } from "./mintnft/holdings";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div>
        
        <MyHoldings/>
      </div>
    </>
  );
};

export default Home;
