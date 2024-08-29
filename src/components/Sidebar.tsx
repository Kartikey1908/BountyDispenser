"use client";
import React, { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
import {
  IconArrowLeft,
  IconBrandTabler,
} from "@tabler/icons-react";
import Image from "next/image";
import { CircleDollarSignIcon, DollarSignIcon, GitCompareArrowsIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SidebarDemo() {

  const {data: session} = useSession();
  const router = useRouter();

  useEffect(() =>{
      if (!session) {
          router.push("/");
      }
  }, [session, router]);


const handleSignOut = async () => {
  console.log("Signing out...");
  await signOut({ redirect: false });
  // Optionally redirect after sign out to avoid re-login
  router.push("/");  // Change to your desired route
};


  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconBrandTabler className="text-neutral-50 h-7 w-7 flex-shrink-0" />
      ),
    },
    {
      label: "Repositories",
      href: "/dashboard/repos",
      icon: (
        <GitCompareArrowsIcon className="text-neutral-50 h-7 w-7 flex-shrink-0" />
      ),
    },
    {
      label: "All Bounties",
      href: "/bounties",
      icon: (
        <CircleDollarSignIcon className="text-neutral-50 h-7 w-7 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "/",
      icon: (
        <IconArrowLeft className="text-neutral-50 h-7 w-7 flex-shrink-0" />
      ),

      onClick: handleSignOut,
    },
  ];
  const [open, setOpen] = useState(false);
  return (
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <div
                key={idx}
                onClick={link.onClick ? link.onClick : undefined}
                className="cursor-pointer"
              >
                <SidebarLink link={link} />
              </div>
            ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: session?.user?.name || "",
                href: "#",
                icon: (
                  <Image
                    src= {session?.user?.image || ""}
                    className="h-8 w-8 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
  );
}
