"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/moving-border"; 
import Loading from "@/components/Loading";
import { useDebounceCallback } from "usehooks-ts"; // Import the debouncing hook

export default function Home() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<any[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRepos = async () => {
      if (session?.accessToken) {
        try {
          const response = await axios.get("/api/get-user-repos");
          setRepos(response.data.repos);
          setFilteredRepos(response.data.repos); // Initialize filtered repos
        } catch (error) {
          console.error("Error fetching repositories", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRepos();
  }, [session]);

  useEffect(() => {
    if (session === null && router) {
      router.push("/");
    }
  }, [session, router]);

  const handleRepoClick = (repoName: string) => {
    router.push(`/dashboard/repos/${repoName}`);
  };

  const handlePullRequestButtonClick = (repoName: string) => {
    router.push(`/dashboard/repos/${repoName}/pull-requests`);
  };

  const handleSearchChange = useDebounceCallback((search: string) => {
    const lowercasedSearch = search.toLowerCase();
    const filtered = repos.filter(repo =>
      repo.name?.toLowerCase().includes(lowercasedSearch) ||
      repo.description?.toLowerCase().includes(lowercasedSearch)
    );
    setFilteredRepos(filtered);
  }, 500); // Debounce delay of 500ms

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearchChange(value);
  };

  if (loading) {
    return <Loading />;
  }
  

  return (
    <div className="flex-col bg-[rgb(2,6,21)]">
      <div className="flex-1 min-h-[calc(100vh-8.5rem)]">
        <main className="p-6">
          {!session ? (
            <p>Not signed in</p>
          ) : (
            <div className="mt-6">
              
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  Your Github Repositories:
                </h2>
                <input
                  type="text"
                  placeholder="Search Repositories..."
                  value={searchTerm}
                  onChange={onSearchInputChange}
                  className="mb-4 p-2 rounded-md bg-slate-200 focus:bg-white border border-gray-300"
                />
              </div>
              <div className="w-full mt-12 grid lg:grid-cols-4 grid-cols-1 gap-10">
                {filteredRepos.map((repo) => (
                  <Button
                    key={repo.id}
                    duration={Math.floor(Math.random() * 10000) + 10000}
                    borderRadius="1.75rem"
                    style={{
                      background: "rgb(4,7,29)",
                      backgroundColor: "linear-gradient(90deg, rgba(2,7,29,1) 0%, rgba(12,14,35,1) 100%)",
                      borderRadius: `calc(1.75rem * 0.96)`,
                    }}
                    className="flex-1 text-white dark:text-white border-neutral-200 dark:border-slate-800"
                  >
                    <div className="flex flex-col w-3/4 p-3 py-6 md:p-5 lg:p-10 gap-2 overflow-hidden">
                      <div className="flex-1">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <h1 className="text-start text-xl md:text-2xl font-bold hover:underline">
                            {repo.name}
                          </h1>
                        </a>
                        <p className="text-start text-white-100 mt-3 font-semibold truncate">
                          {repo.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-y-2 flex-col w-1/4 justify-between items-end p-2">
                      <button
                        className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                        onClick={() => handleRepoClick(repo.full_name)}
                      >
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                          Issues
                        </span>
                      </button>
                      

                      <button
                        onClick={() => handlePullRequestButtonClick(repo.full_name)}
                        className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 mb-2"
                      >
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                          Pull requests
                        </span>
                      </button>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </main>
        
      </div>
      <footer className="bg-blue-700 text-white p-4 text-center">
          &copy; {new Date().getFullYear()} Github Bounty Dispenser. All rights reserved.
        </footer>
    </div>
  );
}
