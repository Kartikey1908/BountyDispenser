import dbConnect from "@/lib/dbConnect";
import Bounty from "@/model/Bounty";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(req : Request, res : NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized access",
        }, {status: 403});
    }

    const userId = session._id;
    // // console.log(session);


    try {
        await dbConnect();

        // console.log("Inside create bounty");

        const {repo_name, issue_number, amount, signature, title, body, publicKey} : 
            {
                repo_name : string, 
                issue_number: string, 
                amount : string,
                signature: string,
                title: string,
                body: string,
                publicKey: string
            } = await req.json();

        if (!repo_name || !issue_number || !amount  || !signature || !title || !publicKey) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields",
            }, { status: 400 });
        }

        // console.log({repo_name, issue_number, amount, signature, publicKey})

        const existingBounty = await Bounty.findOne({
            repo_name, 
            issue_number, 
            created_by: userId
        });
        // console.log(existingBounty);

        if(existingBounty){
            return NextResponse.json({
                success: false,
                message: "Cannot create a bounty. Bounty Already Exists"
            }, {status : 401})
        }


        const connection = new Connection(process.env.CONNECTION_URL as string, {
            commitment: 'confirmed'
        });
        
       

        // await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });

        const transaction = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 1, 
        } );
       


        if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== Number(amount)) {
            return NextResponse.json({
                success: false,
                message: "Transaction signature/amount incorrect"
            })
        }

        if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== process.env.NEXT_PUBLIC_PARENT_WALLET_ADDRESS) {
            return NextResponse.json({
                success: false,
                message: "Transaction sent to wrong address"
            })

        }

        const newBounty = await Bounty.create({
            amount: amount,
            repo_name : repo_name,
            issue_number: issue_number, 
            created_by: userId,
            created_at: Date.now(),
            title: title,
            body: body,
            signature: signature,
            publicKey: publicKey
        })
        

        if (!newBounty) {
            return NextResponse.json({
                success: false,
                message: "Cannot create a bounty. Please try again later"
            }, {status : 401})
        }

        return NextResponse.json({
            success: true,
            message: "Bounty created successfully", 
            bounty : "newBounty",
        }, {status : 200})


    } catch (error) {
        // console.log("Error occured while creating new bounty",error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Errror"
        }, {status : 500})
    }
}
