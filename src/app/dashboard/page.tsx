"use client";

import Loading from "@/components/Loading";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { useToast } from "@/components/ui/use-toast";
import {  useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Dosis } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"; // Update the import path as necessary


export default function Address() {
  const [issues, setIssues] = useState<any[]>([]);
  const {data: session} = useSession();
  const [totalBountyAmount, setTotalBountyAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [userBalance, setUserBalance] = useState<string>("");
  const router = useRouter();



  useEffect(() => {
    async function fetchIssues() {
      try {
        const response = await axios.get(`/api/get-issues`); // Adjust the URL as per your API route
        
        if (!response.data.success) {
          throw new Error("Cannot fetch issues");
        }

        // console.log(response);
        setIssues(response.data.issues)
        setTotalBountyAmount(response.data.totalAmount);

        
      } catch (error) {
        console.error("Error fetching issues: ", error);
      }
      setLoading(false);
    }

    fetchIssues();
  }, []);

  async function fetchUserBalance() {
    try {
      const response = await axios.get("/api/get-user-balance");

      if (!response.data.success) {
        throw new Error("Cannot fetch user balance")
      }
      // console.log("Fetch user balance api response....", response);
      
      setUserBalance(response.data.userBalance);
    } catch (error) {
      // console.log("Error occured while fetching user Balance", error);
    }
  }

  useEffect (() =>{
    

    fetchUserBalance();
  }, [])



  useEffect(()=>{
    if (session === null && router) {
      router.push("/");
    }
  }, [session, router]);

  if (loading) {
    return (
      <Loading/>
    )
  }



  return (
    <main className="flex min-h-screen flex-col items-center justify-evenly p-24 bg-[rgb(2,6,21)]">
      <CardSpotlightDemo fetchUserBalance={fetchUserBalance} issues={issues} userBalance={userBalance} totalBountyAmount={totalBountyAmount}/>
      <BountyIssuesSection setIssues={setIssues} issues={issues} setLoading={setLoading} 
        setTotalBountyAmount={setTotalBountyAmount}
      />
    </main>
  );
}

function CardSpotlightDemo({issues, totalBountyAmount, userBalance, fetchUserBalance}: {issues: any[], totalBountyAmount: number, userBalance: string, fetchUserBalance: Function}) {
  const {data : session} = useSession();
  const { publicKey } = useWallet();
  const { toast, dismiss }  = useToast();
  

  async function handlePayout() {
    if (!publicKey) {
      toast({
        variant: "destructive",
        title: "Please connect a wallet.",
        description: "Connect a wallet to recieve the payout"
      });
      return;
    }

    if (Number(userBalance) === 0) {
      toast({
        variant: "destructive",
        title: "No pending amount to process",
        description: "There is no pending amount to process"
      });
      return;
    }
    const toastId = toast({
      variant: "default",
      title: "Processing Payout...",
      description: "Processing the payout. Please wait...",
      duration: Infinity
    });
    try {

      
      
      const response = await axios.post("/api/process-payout", {
        publicKey: publicKey
      });
      // console.log(response.data);
      

      if (!response?.data.success) {
        throw new Error ("Error occured while processing payout");
      }
     
      toastId.dismiss();
      toast({
        variant: "success",
        title: "Payout processed successfully",
        description: `Payout of ${response.data.amount} SOL processed successfully`
      });

      await fetchUserBalance();


    } catch (error) {
      // console.log("An error occured while processing payout");
      toastId.dismiss();
      toast({
        variant: "destructive",
        title: "Error occured while processing payout",
      });
      
    }
  }

  return (
    <CardSpotlight className=" w-[75vw]">
      <div className="flex flex-col sm:flex-row gap-x-16 justify-evenly sm:items-center  relative z-10">
        <div className="flex items-center">
          
          <Image
            src={session?.user?.image || ''}
            width={400}
            height={400}
            alt=""
            layout="responsive"
            style={{filter: "drop-shadow(0 0 16px #eff0da)"}}
            className=" rounded-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-10 sm:mt-0 mt-8 sm:items-start items-center">
          <div className="text-white text-5xl flex flex-col gap-y-2">
            <p>{session?.user?.name}</p>
            <div className="text-slate-500 text-2xl px-2">
              @{session?.user?.profile?.login} 
            </div>
            
          </div>
          
          <div className="text-gray-300 text-2xl flex flex-col gap-y-3">
            
            <div>
              Active Bounties: {issues?.length} 
            </div>
            <div className="">
              Active Bounty Issued: {totalBountyAmount} SOL
            </div>
            
          </div>

          <div className="text-gray-300 text-2xl pt-4 flex flex-col gap-y-3 w-full">
            <div>
                Payout Balance : {userBalance} SOL
              </div>
              <button
                  onClick={() => handlePayout()}
                  className="relative inline-flex h-12 w-2/3    rounded-md overflow-hidden p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 mb-2"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-slate-950 px-5 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                    Process Payout
                  </span>
              </button> 
            </div>
        <div>

          </div>
        </div>
      </div>
    </CardSpotlight>

  );
}

const Step = ({ title }: { title: string }) => {
  return (
    <li className="flex gap-2 items-start">
      <CheckIcon />
      <p className="text-white">{title}</p>
    </li>
  );
};


const CheckIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M12 2c-.218 0 -.432 .002 -.642 .005l-.616 .017l-.299 .013l-.579 .034l-.553 .046c-4.785 .464 -6.732 2.411 -7.196 7.196l-.046 .553l-.034 .579c-.005 .098 -.01 .198 -.013 .299l-.017 .616l-.004 .318l-.001 .324c0 .218 .002 .432 .005 .642l.017 .616l.013 .299l.034 .579l.046 .553c.464 4.785 2.411 6.732 7.196 7.196l.553 .046l.579 .034c.098 .005 .198 .01 .299 .013l.616 .017l.642 .005l.642 -.005l.616 -.017l.299 -.013l.579 -.034l.553 -.046c4.785 -.464 6.732 -2.411 7.196 -7.196l.046 -.553l.034 -.579c.005 -.098 .01 -.198 .013 -.299l.017 -.616l.005 -.642l-.005 -.642l-.017 -.616l-.013 -.299l-.034 -.579l-.046 -.553c-.464 -4.785 -2.411 -6.732 -7.196 -7.196l-.553 -.046l-.579 -.034a28.058 28.058 0 0 0 -.299 -.013l-.616 -.017l-.318 -.004l-.324 -.001zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083 .094l-4 4a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 1.32 -1.497l.094 .083l1.293 1.292l3.293 -3.292z"
        fill="currentColor"
        strokeWidth="0"
      />
    </svg>
  );
};

// Component to display issues with bounties
function BountyIssuesSection({setIssues, issues, setLoading, setTotalBountyAmount} : 
  {
    issues: any[], 
    setIssues: Function, 
    setLoading: Function,
    setTotalBountyAmount: Function
  }) {
    const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deletingBounty, setDeletingBounty] = useState(false);
    const { toast } = useToast();
  
  const deleteBounty = async (issue_id : string) => {
    const toastId = toast({
      variant: "default",
      title: "Deleting Bounty...",
      description: "Deleting bounty. Please wait...",
      duration: Infinity
    });
    setDeletingBounty(true);
    try {
      const response = await axios.post("/api/remove-bounty", {
        issue_id: issue_id,
      });
      if (!response.data.success) {
        throw new Error("Error occured while deleting bounty");
      }
      toastId.dismiss();
      toast({
        variant: "success",
        title: "Bounty deleted successfully",
        description: "Bounty deleted successfully",
      })
      // console.log(response.data);
      setIssues(response?.data?.issues)
      setTotalBountyAmount(response?.data?.totalBountyAmount || "0");
    } catch (error) {
      toastId.dismiss();
      toast({
        variant: "destructive",
        title: "Error occured while deleting bounty",
        description: "An error occured while deleting bounty",
      })
      // console.log("An error occured while deleting bounty", error);
    }
    setDeletingBounty(false);

    
  }

  const handleConfirmDelete = () => {
    if (selectedIssue) {
      deleteBounty(selectedIssue);
      setSelectedIssue(null);
      setIsDialogOpen(false);
    }
  }
  

  return (
    <section className="mt-8 w-[90vw]">
      <h2 className="text-2xl font-bold text-white text-center">Issues with Bounty</h2>
      <ul className="mt-4 space-y-2">
        {issues?.length > 0 ? (
          issues.map((issue) => (
            <li key={issue._id} className="border flex flex-row justify-between p-6 border-blue-800 rounded-3xl transition-shadow hover:shadow-lg hover:shadow-black/50">
              <div>
                <h3 className="text-2xl font-semibold text-white">{issue.repo_name} / {issue.title}  <span className="text-slate-500 text-xl">#{issue.issue_number}</span></h3>
                <p className="text-neutral-300 mt-2">{issue.body}</p>
              </div>
              <div className="flex flex-col space-y-3">
                <p className="text-blue-500 mt-2 text-lg text-center font-bold">Bounty: {Number(issue.amount)/LAMPORTS_PER_SOL} SOL</p>
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={deletingBounty}
                      onClick={() => setSelectedIssue(issue._id)}
                      className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 mb-2"
                    >
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                        Cancel Bounty
                      </span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl text-white">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the bounty.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-md border-1 border-blue-700" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction className="bg-red-700 border border-slate-200 text-md" onClick={handleConfirmDelete}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))
        ) : (
          <p className="text-neutral-300">No issues with Bounties found.</p>
        )}
      </ul>
    </section>

    
  );
}
