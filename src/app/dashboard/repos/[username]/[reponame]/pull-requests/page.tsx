"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/moving-border";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/components/ui/use-toast";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import Image from "next/image";

// Pull Request type
type PullRequest = {
  id: number;
  title: string;
  html_url: string;
  user: {
    id: string;
    login: string;
    avatar_url: string;
  };
  amount: string;
};

export default function PullRequests() {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [hasBounty, setHasBounty] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const owner = params.username;
  const repo = params.reponame;
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [txnSignature, setTxnSignature] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (session === null && router) {
      router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    async function fetchPullRequests() {
      if (session?.accessToken && owner && repo) {
        try {
          // console.log("in");
          const response = await axios.get(`https://api.github.com/repos/${session?.user?.profile?.login}/${repo}/pulls?page=1&per_page=100&state=all`,{
            headers: {
                Authorization: `token ${session.accessToken}`,
            },
          });
          // console.log(response);
          // Map the response data to your PullRequest type
          const pullRequests = response.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            html_url: item.html_url,
            user: {
              login: item.user.login,
              avatar_url: item.user.avatar_url,
              id: item.user.id,
              
            },
            amount: "",
          }));

          setPullRequests(pullRequests);
        } catch (error) {
          console.error("Error fetching pull requests:", error);
        } 
        // console.log("in");
      }
      setLoading(false);
    }

    fetchPullRequests();
  }, [owner, repo, session]);

  const handleClick = (pr: any) => {
    makePayment(pr);
  };
  

  const makePayment = async (pr: any) => {
    if(!publicKey){
      toast({
        variant: "destructive",
        title: "Please Connect to Wallet",
        description: `You cannot pay without Connecting to the Wallet`,
      })
      return;
    }
    if (!pr.amount || Number(pr.amount) === 0) {
      toast({
        variant: "destructive",
        title: "No amount entered",
        description: "Please fill the amount. Amount cannot be empty or zero.",
      })
      return;
    }
    
    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
            fromPubkey: publicKey!,
            toPubkey: new PublicKey('EnCYWZurWXDqSDcsCE4pzJiECnCGGFnaybAjPQTs7R7g`'),
            lamports: Number(pr.amount) * LAMPORTS_PER_SOL, // Use the input amount here
            })
        );
    
        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext();
    
        const signature = await sendTransaction(transaction, connection, { minContextSlot });
        toast({
            title: "Payment Intiated",
            description: `Your payment  is being initiated. Please do not close or refresh the page.`,
        })
        const transaction34 = await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
        setTxnSignature(signature);
        // console.log(signature);
        // console.log(transaction34)
        
        const amountInLamports = Number(pr.amount) * LAMPORTS_PER_SOL;
        // console.log("Amount in lamports", amountInLamports);
        const response = await axios.post(`/api/send-bounty`, { 
            pr_user_name: pr.user.login,
            pr_user_id: pr.user.id,
            signature: signature,
            amount: String(amountInLamports),
        });
        

        
        toast({
            variant: "success",
            title: "Payment Succeeded",
            description: `Your payment is successful`,
        })


    } catch (error) {
        // console.log("Error occurred, transaction failed", error);
        toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: "There was an error, Please try again later",
        })
    }
  };

  if (loading) {
    return <Loading />;
  }
  

  return (
    <div className="min-h-screen p-6 bg-[#020615]">
      <h2 className="text-3xl font-bold text-white mb-4">{`Pull Requests for ${owner} / ${repo}`}</h2>
      {pullRequests.length > 0 ? (
        <div className="w-full mt-12 grid lg:grid-cols-1 grid-cols-1 gap-10">
          {pullRequests.map((pr) => (
            <Button
              key={pr.id}
              duration={Math.floor(Math.random() * 10000) + 10000}
              borderRadius="1.75rem"
              style={{
                background: "rgb(4,7,29)",
                backgroundColor: "linear-gradient(90deg, rgba(2,7,29,1) 0%, rgba(12,14,35,1) 100%)",
                borderRadius: `calc(1.75rem * 0.96)`,
              }}
              className="flex-1 cursor-default text-white dark:text-white border-neutral-200 dark:border-slate-800"
            >
                <div className="flex flex-col ml-0 justify-center items-end">
                    
                    <Image
                      src={pr.user.avatar_url}
                      width={20}
                      height={20}
                      alt={`${pr.user.login}'s avatar`}
                      className="w-10 h-10 rounded-full mb-2"
                    />
                </div>
                <div className="flex flex-col w-8/12 p-3 py-6 md:p-5 lg:p-10 gap-2 overflow-hidden">
                    <div className="flex-1">
                    <a
                        href={pr.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <h1 className="text-start text-xl md:text-2xl font-bold hover:underline cursor-pointer">
                        {pr.title}
                        </h1>
                    </a>
                    <p className="text-start text-white-100 mt-3 font-semibold truncate">
                        by {pr.user.login}
                    </p>
                </div>
                </div>
                <div className="flex flex-col w-1/4 justify-between items-end p-2">
                

                <div className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 mb-2">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <input
                    type="text"
                    value={pr.amount}
                    onChange={(e) => {
                      if (!isNaN(Number(e.target.value))) {
                        const updatedPullRequests = pullRequests.map((val) => {
                            return val.id === pr.id ? {...pr, amount : e.target.value} : val;
                        })
                        setPullRequests(updatedPullRequests);

                      }
                    }}
                    className={`inline-flex cursor-text h-full w-full items-center justify-center rounded-full bg-slate-950 px-5 py-1 text-sm font-medium 
                     backdrop-blur-3xl text-center focus:outline-none appearance-none text-white`}
                    placeholder="Amount in SOL"
                  />
                </div>
                

                <button
                    onClick={() => {
                      // console.log('Button clicked');
                      handleClick(pr);
                    }}
                    className="group relative inline-flex h-12 w-full overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 mb-2"
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                      Send Bounty
                    </span>
                  </button>

              </div>
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No pull requests found for this repo.</p>
      )}
    </div>
  );
}
