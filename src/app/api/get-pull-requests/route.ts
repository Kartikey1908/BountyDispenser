import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { authOptions } from "../auth/[...nextauth]/options";
import Bounty from "@/model/Bounty";

export async function GET(req : NextRequest, res : NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.accessToken) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized access",
        }, {status: 403});
    }

    const userId = session._id;

    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const repoName = searchParams.get('repo_name') as string
        const issueNumber = searchParams.get('issue_number') as string

        const query = `repo:${session?.user?.profile?.login}/${repoName} type:pr ${issueNumber}`;
        const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}`;

        const response = await axios.get(url, {
            headers: {
              Authorization: `token ${session.accessToken}`,
            },
        });
        

        const bounty = await Bounty.findOne({
            repo_name : repoName,
            issue_number : issueNumber,
            created_by : userId,
        });

        console.log(bounty);

        let hasBounty = false;
        let amount = "";

        if (bounty) {
            hasBounty = true;
            amount = (Number(bounty.amount)/LAMPORTS_PER_SOL).toString();
        }


        return NextResponse.json({
            success: true,
            message: "Successfully fetched all pull requests of this issue", 
            pullRequests: response.data,
            hasBounty,
            amount,
        }, {status : 200})


    } catch (error) {
        console.log("Error occured while fetching pull requests",error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Errror, Cannot fetch pull requests"
        }, {status : 500})
    }
}
