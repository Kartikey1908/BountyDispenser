"use client"
import { useSession } from "next-auth/react"
import PrimaryButton from "./PrimaryButton"
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {  useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HomeIcon } from "lucide-react";

export default function AppBar() {
    const {data: session} = useSession();
    const {publicKey} = useWallet();
    const router = useRouter();

    const pathname = usePathname();

    useEffect(() => {
        if (publicKey) {
            console.log(publicKey.toString());
            try {
                
            } catch (error) {
                
            }
        }
    }, [publicKey])

    if(pathname === '/'){
        return <></>
    }

    return (
        <>
            <div className="flex flex-row justify-between px-6 py-4 bg-black max-h-[5.1rem]">
                <div className="text-3xl font-bold flex items-center text-white">
                    Bounty Dispenser
                </div>
                
                <div className="flex gap-x-4 items-center">
                    {session && (
                        <div className="flex items-center">
                            <HomeIcon
                                fontSize={28}
                                color="white"
                                onClick={() => router.push('/dashboard')}
                                className="cursor-pointer"
                            />
                        </div>
                    )}
                    <PrimaryButton/>
                    {session && (publicKey === null) && 
                        <WalletMultiButton style={{}} />
                    }
                    {publicKey && 
                        <WalletDisconnectButton/>
                    }
                </div>
            </div>
        </>
    )

}
