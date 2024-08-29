import dbConnect from "@/lib/dbConnect";
import Bounty from "@/model/Bounty";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import User from "@/model/User";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(req : NextRequest, res : NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized access",
        }, {status: 403});
    }

    const userId = session._id;
    // // console.log("Session user", userId);
    // // console.log(session);


    try {
        await dbConnect();

        // TODO : verify that there are 0 pull requests



        const {pr_user_name, pr_user_id, repo_name, issue_number, pr_id} = await req.json();

        // console.log(pr_user_name, pr_user_id, repo_name, issue_number, pr_id);

        if (!pr_user_name || !pr_user_id || !repo_name || !issue_number || !pr_id) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields",
            }, { status: 400 });
        }


        

        const existingBounty = await Bounty.findOne({
            repo_name,
            issue_number,
            created_by: userId,
        });
        // console.log(existingBounty);

        if (!existingBounty ) {
            return NextResponse.json({
                success: false,
                message: "Bounty does not exist"
            }, {status: 404})
        }
        // console.log("Bounty user", existingBounty.created_by);

        if (existingBounty.status === "closed") {
            return NextResponse.json({
                success: false,
                message: "Bounty already closed"
            }, {status: 400})
        }
    

        const bountyWinner = await User.findOne({
            github_id: pr_user_id,
            github_username: pr_user_name,
        });

        existingBounty.status = "closed";
        await existingBounty.save();

        // console.log(bountyWinner);

        if (!bountyWinner) {
            const newBountyWinner = await User.create({
                github_id: pr_user_id,
                github_username: pr_user_name,
                pending_amount: existingBounty.amount,
            });


        }
        else {
            bountyWinner.pending_amount = (Number(bountyWinner.pending_amount) + Number(existingBounty.amount)).toString();
            // console.log(bountyWinner.pending_amount);
            await bountyWinner.save();
        }

        return NextResponse.json({
            success: true,
            message: "Bounty Tranferred Successfully", 
        }, {status : 200})


    } catch (error) {
        // console.log("Error occured while creating new bounty",error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Errror"
        }, {status : 500})
    }
}
