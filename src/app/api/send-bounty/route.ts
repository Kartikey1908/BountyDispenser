import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
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
    console.log("Session user", userId);
    // console.log(session);


    try {
        await dbConnect();

        // TODO : verify that there are 0 pull requests

        const {pr_user_name, pr_user_id, signature, amount} = await req.json();

        console.log(pr_user_name, pr_user_id)

        if (!pr_user_name || !pr_user_id ||!signature ||!amount) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields",
            }, { status: 400 });
        }

        // TODO: verify signature

        const connection = new Connection(process.env.CONNECTION_URL as string, {
            commitment: 'confirmed'
        });
        

        const transaction = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 1, 
        } );
       


        if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== Number(amount)) {
            return NextResponse.json({
                success: false,
                message: "Transaction signature/amount incorrect"
            })
        }

        if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== process.env.PARENT_WALLET_ADDRESS) {
            return NextResponse.json({
                success: false,
                message: "Transaction sent to wrong address"
            })

        }


        const bountyWinner = await User.findOne({
            github_id: pr_user_id,
            github_username: pr_user_name,
        });


        console.log(bountyWinner);

        if (!bountyWinner) {
            const newBountyWinner = await User.create({
                github_id: pr_user_id,
                github_username: pr_user_name,
                pending_amount: amount,
            });


        }
        else {
            bountyWinner.pending_amount = (Number(bountyWinner.pending_amount) + Number(amount)).toString();
            console.log(bountyWinner.pending_amount);
            await bountyWinner.save();
        }

        return NextResponse.json({
            success: true,
            message: "Bounty Tranferred Successfully", 
        }, {status : 200})


    } catch (error) {
        console.log("Error occured while creating new bounty",error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Errror"
        }, {status : 500})
    }
}
