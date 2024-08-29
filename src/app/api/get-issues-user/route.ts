import dbConnect from "@/lib/dbConnect";
import Bounty from "@/model/Bounty";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req : NextRequest, res : NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.accessToken) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized access",
        }, {status: 403});
    }

    const userId = session._id;
    // const userId = "66ba4851f1d7eb56aab28674"

    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const repoName = searchParams.get('repo_name') as string
        const userName = searchParams.get('user_name') as string
        
        // TODO : remove userName if not used
        console.log({ userId, repoName, userName})
        console.log(session.accessToken)


        const bountyIssues = await Bounty.find(
            {
                repo_name : repoName,
                created_by : userId,
            },   
        )

        

        const response = await axios.get(`https://api.github.com/repos/${session.user.profile.login}/${repoName}/issues`, {
            headers: {
                Authorization: `token ${session.accessToken}`,
            },
        });

        if (!response) {
            return NextResponse.json({
                success: false,
                message: "Cannot fetch issues.", 
            }, {status : 404})
        }

        const githubIssues = response.data.filter((issue: any) => issue.pull_request === undefined);

        const bountyIssuesMap = new Map(bountyIssues.map(issue => [Number(issue.issue_number), issue]));
    
        
        const combinedIssues = githubIssues.map((issue: any) => {
            
            
            return {
            ...issue,
            hasBounty: bountyIssuesMap.has(issue.number),
            amount: bountyIssuesMap.get(issue.number)?.amount ? (bountyIssuesMap.get(issue.number)?.amount / LAMPORTS_PER_SOL).toString() : "",
        }});

        return NextResponse.json({
            success: true,
            message: "Issues having bouties fetched successfully", 
            issues: combinedIssues,
        }, {status : 200})


    } catch (error) {
        console.log("Error occured while creating new bounty",error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Errror"
        }, {status : 500})
    }
}
