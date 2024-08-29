import { SidebarDemo } from "@/components/Sidebar";
import { cn } from "@/lib/utils";


export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    

    return (
        <div className={cn(
            " flex flex-col md:flex-row bg-[#152c45] w-full flex-1 max-w- mx-auto  overflow-hidden",
            "h-[calc(100vh-5.1rem)] " // for your use case, use `h-screen` instead of `h-[60vh]`
        )}>
            <SidebarDemo />

            <div className="h-full w-full rounded-tl-[2rem] overflow-auto">
                {children}
            </div>


        </div>
  );
}
