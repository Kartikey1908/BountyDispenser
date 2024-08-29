"use client";
import Loading from "@/components/Loading";
import { Bounty } from "@/model/Bounty";
import axios from "axios";
import { useEffect, useState } from "react";
import { Meteors } from "@/components/ui/meteors"; // Adjust the import path as necessary
import { useSession } from "next-auth/react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function BountiesPage() {
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { data: session } = useSession();

    useEffect(() => {
        async function fetchBounties() {
            try {
                const response = await axios.get("/api/get-bounties?page=1&limit=4");
                if (response.data.success) {
                    setBounties(response.data.bounties);
                }
            } catch (error) {
                console.error("Error fetching bounties:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchBounties();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <main className="relative flex flex-col min-h-screen items-center pt-8 px-8 bg-[rgb(2,6,21)]">
            {/* Meteor Background */}
            {/* <div className="absolute inset-0 z-0">
                <Meteors number={60} />
            </div> */}

            <h1 className="text-2xl text-white font-bold mb-6 z-10">Available Bounties</h1>
            <section className="mt-8 w-[90vw] z-10">
                <ul className="mt-4 space-y-2">
                    {bounties.length > 0 ? (
                        bounties.map((bounty, index) => (
                            <li key={index} className="border flex flex-row justify-between p-6 border-blue-800 rounded-3xl transition-shadow hover:shadow-lg hover:shadow-black/50">
                                <div>
                                    <h3 className="text-2xl font-semibold text-white">
                                        <a
                                            href={`https://github.com/${bounty.created_by.github_username}/${bounty.repo_name}/issues/${bounty.issue_number}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                        >
                                            {bounty.repo_name}/{bounty.title}{" "}
                                        </a> 
                                        <span className="text-slate-500 text-xl px-2">#{bounty.issue_number}</span>
                                    </h3>
                                    <p className="text-neutral-300 mt-2">{bounty.body}</p>
                                </div>
                                <div className="flex flex-col space-y-3">
                                    <p className="text-blue-500 mt-2 text-lg text-center font-bold">Bounty: {(Number(bounty.amount) / LAMPORTS_PER_SOL).toString()} SOL</p>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-white">No issues with Bounties found.</p>
                    )}
                </ul>
            </section>
        </main>
    );
}
