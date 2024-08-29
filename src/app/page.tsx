"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Vortex } from "@/components/ui/vortex";
import PrimaryButton from "@/components/PrimaryButton";
import { CircleDollarSignIcon } from "lucide-react";

const Page = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session && router) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="w-full h-screen overflow-hidden">
      <Vortex
        backgroundColor="black"
        rangeY={800}
        particleCount={500}
        baseHue={120}
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
      >
        <div className="flex flex-col items-center text-center">
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
            Bounty Dispenser
          </h1>
          <p className="text-white text-xl md:text-2xl max-w-lg mb-6">
            Welcome to the Strange Bounty Dispenser! This platform helps you dispense bounties to those who solve your issues on Github.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <PrimaryButton/>
            <button 
              onClick={() => router.push("/bounties")}
              type="button" 
              className="flex gap-x-2 items-center text-gray-900  bg-white border border-gray-300 focus:outline-none
              hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg px-5 py-2.5 
                dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 
              dark:hover:border-gray-600 dark:focus:ring-gray-700">
                <CircleDollarSignIcon
                  size={28}
                />
                
                <span className="text-lg">Available Bounties</span>
            </button>
            
          </div>
        </div>
      </Vortex>
    </div>
  );
};

export default Page;
