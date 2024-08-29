import dbConnect from "@/lib/dbConnect";
import Bounty from "@/model/Bounty";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req: NextRequest, res: NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized access",
        }, { status: 403 });
    }

    const userId = session._id;

    try {
        await dbConnect();

        console.log({ userId });

        const issues = await Bounty.find({
            created_by: userId,
        });

        if (!issues || issues.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No issues found",
            }, { status: 404 });
        }

        // Summing up the bounty amounts in SOL
        let totalBountyAmount = issues.reduce((acc, issue) => {
            let amountInSOL = Number(issue.amount) / LAMPORTS_PER_SOL;
            return acc + (isNaN(amountInSOL) ? 0 : amountInSOL);
        }, 0);

        console.log(totalBountyAmount);

        return NextResponse.json({
            success: true,
            message: "Issues with bounties fetched successfully",
            totalAmount: totalBountyAmount,
            issues: issues,
        }, { status: 200 });

    } catch (error) {
        console.log("Error occurred while fetching issues:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, { status: 500 });
    }
}
