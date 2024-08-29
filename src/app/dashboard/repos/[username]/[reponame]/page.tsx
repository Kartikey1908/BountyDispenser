"use client";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/moving-border";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { headers } from "next/headers";
import { useToast } from "@/components/ui/use-toast";
import Loading from "@/components/Loading";
import { SquareArrowOutUpRight } from "lucide-react";


const RepoIssuesPage = () => {  

  // TODO : Update the existing amount of bounty if user pays again for same issue

  const pathName = usePathname();
  let paths = pathName.split('/');
  const searchParams = useSearchParams();
  const params = useParams();

  const repoName = `${paths[3]}/${paths[4]}`;
  console.log(paths);

  const { data: session } = useSession();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [txnSignature, setTxnSignature] = useState('');
  const { toast } = useToast();


  const fetchIssues = async () => {
    if (repoName && session?.accessToken) {
      try {
        // const response = await axios.get(`https://api.github.com/repos/${repoName}/issues`, {
        //   headers: {
        //     Authorization: `token ${session.accessToken}`,
        //   },
        // });
        const response = await axios.get(`/api/get-issues-user?repo_name=${params.reponame}&user_name=${params.username}`,  {
          headers: {
            Authorization: `token ${session.accessToken}`,
          },
        })

        if (!response.data.success) {
          throw new Error("Error fetching issues");
        }
        
        console.log(response);
        setIssues(response.data.issues);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching issues", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    

    fetchIssues();
  }, [repoName, session]);  

  



  useEffect(() => {
    if(session === null && router){
      router.push('/');
    }
  },[session, router]);


  const handleClick = (issue: any) => {
    console.log('handleClick called', {issue});
    if (issue.hasBounty) {
      console.log('Navigating to pull requests...');
      router.push(`/dashboard/repos/${repoName}/issue/${issue.number}/pull-requests`);
    } else {
      console.log('Making payment...');
      makePayment(issue);
    }
  };
  

  const makePayment = async (issue: any) => {
    if(!publicKey){
      toast({
        variant: "destructive",
        title: "Please Connect to Wallet",
        description: `You cannot pay without Connecting to the Wallet`,
      })
      return;
    }
    if (!issue.amount || Number(issue.amount) === 0) {
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
            toPubkey: new PublicKey(process.env.NEXT_PUBLIC_PARENT_WALLET_ADDRESS as string),
            lamports: Number(issue.amount) * LAMPORTS_PER_SOL, // Use the input amount here
            })
        );
    
        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext();
    
        const signature = await sendTransaction(transaction, connection, { minContextSlot });
        toast({
            title: "Payment Intiated",
            description: `Your payment for issue #${issue.number} is being initiated. Please do not close or refresh the page.`,
        })
        const transaction34 = await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
        setTxnSignature(signature);
        console.log(signature);
        console.log(transaction34)
        
        const amountInLamports = Number(issue.amount) * LAMPORTS_PER_SOL;
        console.log("Amount in lamports", amountInLamports);
        const response = await axios.post("/api/create-bounty", {
            repo_name: paths[4], 
            issue_number: issue.number, 
            amount: String(amountInLamports),
            signature: signature,  
            title: issue.title,
            body: issue.body,
            publicKey : publicKey?.toBase58(),   
        })



        console.log("Issues api response",response);
        const updatedIssues = issues.map(val => {
          return val.id === issue.id ? {...issue, amount: ''} : val;
        })

        await fetchIssues();

        toast({
            variant: "success",
            title: "Payment Succeeded",
            description: `Your payment for issue #${issue.number} is successful`,
        })


    } catch (error) {
        console.log("Error occurred, transaction failed");
        toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: "There was an error, Please try again later",
        })
    }
  };

  if (loading) {
    return <Loading/>;
  }
  

  return (
    <div className="min-h-screen p-6 bg-[#020615]">
      <h1 className="text-3xl font-bold mb-4 text-white">Issues from {repoName}</h1>
      {issues.length > 0 ? (
        <div className="w-full mt-12 grid lg:grid-cols-1 grid-cols-1 gap-10">
          {issues.map((issue) => (
            <Button
              key={issue.id}
              duration={Math.floor(Math.random() * 10000) + 10000}
              borderRadius="1.75rem"
              style={{
                background: "rgb(4,7,29)",
                backgroundColor: "linear-gradient(90deg, rgba(2,7,29,1) 0%, rgba(12,14,35,1) 100%)",
                borderRadius: `calc(1.75rem * 0.96)`,
              }}
              className="flex-1 cursor-default text-white dark:text-white border-neutral-200 dark:border-slate-800"
            >
              <div className="flex flex-col w-3/4 p-3 py-6 md:p-5 lg:p-10 gap-2 overflow-hidden">
                <div className="flex-1 ">
                    <a 
                      href={issue.html_url} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <h1 className="text-start text-xl md:text-2xl font-bold hover:underline cursor-pointer">
                        {issue.title}
                      </h1>
                    </a>
                    <p className="text-start text-white-100 mt-3 font-semibold truncate">
                      {issue.body}
                    </p>
                 
                </div>
                
              </div>
              <div className="flex flex-col w-1/4 justify-between items-center gap-y-3 p-2">
                
                  {issue.hasBounty ? (
                      <p className="text-blue-500 mt-2 text-lg text-center font-bold">
                        Bounty: {Number(issue.amount)} SOL
                      </p>
                    ) : (
                      <div className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 mb-2">
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                        <input
                          type="text"
                          value={issue.amount}
                          disabled={issue.hasBounty}
                          onChange={(e) => {
                          if (!isNaN(Number(e.target.value))) {
                            const updatedIssues = issues.map((val) => {
                                return val.id === issue.id ? {...issue, amount : e.target.value} : val;
                            })
                            setIssues(updatedIssues);

                          }
                        }}
                          className={`inline-flex cursor-text h-full w-full items-center justify-center rounded-full bg-slate-950 px-5 py-1 text-sm font-medium 
                          backdrop-blur-3xl text-center focus:outline-none appearance-none ${issue.hasBounty ? "text-red-500" : "text-white"}`}
                          placeholder="Amount in SOL"
                        />
                    </div>

                  )}
                  

                <button
                    onClick={() => {
                      console.log('Button clicked');
                      handleClick(issue);
                    }}
                    className="group relative inline-flex h-12 w-full overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 mb-2"
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                      {issue.hasBounty ? (
                        <>
                          <span>See Pull Requests</span>
                        </>
                      ) : (
                        "Set Bounty"
                      )}
                    </span>
                  </button>

              </div>
            </Button>
          ))}
        </div>
      ) : (
        <p>No issues found</p>
      )}
    </div>
    
  );
};

export default RepoIssuesPage;
