"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/moving-border";
import { GitMergeIcon, GitPullRequestArrowIcon, GitPullRequestClosedIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";


enum PullRequestState {
  open = "open",
  closed = "closed",
}


// Pull Request type
type PullRequest = {
  id: number;
  title: string;
  html_url: string;
  state: PullRequestState;
  merged_at: string;
  user: {
    login: string;
    id: string;
    avatar_url: string;
  };
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
  const issueNumber = params.issue_number;

  const handleApproveBounty = async (pr: PullRequest) => {
    console.log("Approve Bounty");
    console.log(pr);
    console.log(owner);
    console.log(repo);
    console.log(issueNumber);
    try {
      
      const response = await axios.post(`/api/approve-bounty`, {
        pr_user_name: pr.user.login,
        pr_user_id: pr.user.id,
        repo_name: repo,
        issue_number: issueNumber,
        pr_id: pr.id,
      });

      if (response.data.success) {
        toast({
          variant: "success",
          title: "Bounty Approved",
          description: "Bounty has been approved successfully",
        });
      }

      console.log(response);
    } catch (error : any) {
      console.error("Error approving bounty:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response.data.message || "An error occurred",
      })
    }
  };

  useEffect(() => {
    if (session === null && router) {
      router.push("/");
    }
  }, [session, router]);


  useEffect(() => {
    async function fetchPullRequests() {
      if (session?.accessToken && owner && repo && issueNumber) {
        try {

          const response = await axios.get(`/api/get-pull-requests?repo_name=${repo}&issue_number=${issueNumber}`);
          
          console.log(response);

          // Map the response data to your PullRequest type
          const pullRequests = response.data.pullRequests.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            html_url: item.html_url,
            state: item.state,
            merged_at: item.merged_at,
            user: {
              login: item.user.login,
              avatar_url: item.user.avatar_url,
              id: item.user.id,
            },
          }));

          

          setPullRequests(pullRequests);
          setHasBounty(response.data.hasBounty);
          console.log(response.data);
          setAmount(response.data.amount);
        } catch (error) {
          console.error("Error fetching pull requests:", error);
        } 
        console.log("in");
      }
      setLoading(false);
    }

    fetchPullRequests();
  }, [owner, repo, issueNumber, session]);

  if (loading) {
    return <Loading />;
  }
  

  return (
    <div className="min-h-screen p-6 bg-[#020615]">
      <h2 className="text-3xl font-bold text-white mb-4">Pull Requests for Issue #{params.issue_number}</h2>
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
                  <div className="flex-1 flex  gap-x-5">
                    <div>
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
                    <div>
                      {pr.state === PullRequestState.open 
                        ? (
                            <GitPullRequestArrowIcon fontSize={24} color="#63BA51"/>
                        ) : (pr.merged_at === null
                          ? ( <GitPullRequestClosedIcon fontSize={24} color="#E95148"/>)
                          : ( <GitMergeIcon fontSize={24} color="#AB7DF8"/>)
                        )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-y-2 w-1/4 justify-between items-center p-2">
                <p className="text-blue-500 mt-2 text-lg text-center font-bold">Bounty: {amount} SOL</p>
                  <button onClick={ () => handleApproveBounty(pr)}
                   className="relative inline-flex h-12 w-3/4 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 mb-2">
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                      Approve Bounty  
                    </span>
                  </button>
                </div>
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No pull requests found for this issue.</p>
      )}
    </div>
  );
}
