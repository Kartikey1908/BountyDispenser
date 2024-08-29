import dbConnect from "@/lib/dbConnect";
import bs58 from "bs58";
import Bounty from "@/model/Bounty";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {  Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
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

        const {issue_id} : 
            {
                issue_id: string,
            } = await req.json();

        if (!issue_id) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields",
            }, { status: 400 });
        }

        console.log({issue_id})

        

        const existingBounty = await Bounty.findById({
            _id: new mongoose.Types.ObjectId(issue_id),

        });
        console.log(existingBounty);

        if (!existingBounty ) {
            return NextResponse.json({
                success: false,
                message: "Bounty does not exist"
            }, {status: 404})
        }
        console.log("Bounty user", existingBounty.created_by);
        if (existingBounty.created_by.toString() !== userId) {
            return NextResponse.json({
                success: false,
                message: "Cannot delete bounty created by another user"
            }, {status: 401})
        }

        const publicKey = existingBounty.publicKey;

        const connection = new Connection(process.env.CONNECTION_URL as string, 'confirmed');
        const parentKeypair = Keypair.fromSecretKey(bs58.decode(process.env.PARENT_WALLET_PRIVATE_KEY as string));
        const recipientPublicKey = new PublicKey(publicKey);
        const amount = existingBounty.amount;

        console.log(amount);
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: parentKeypair.publicKey,
                toPubkey: recipientPublicKey,
                lamports: amount,
            })
        );

        // TODO: cut extra 5000 lamports for fees
        const signature = await sendAndConfirmTransaction(connection, transaction, [parentKeypair]);
        console.log("Transaction signature", signature);
        await Bounty.findByIdAndDelete(issue_id);

        const updatedBounties = await Bounty.find({
            created_by: userId,
        });

        let totalBountyAmount = updatedBounties.reduce((acc, val) => acc + (Number(val.amount))/LAMPORTS_PER_SOL, 0);


        console.log("Bounties after deletion", updatedBounties);

        return NextResponse.json({
            success: true,
            message: "Bounty Deleted Successfully", 
            issues : updatedBounties,
            totalBountyAmount: totalBountyAmount,
        }, {status : 200})


    } catch (error) {
        console.log("Error occured while creating new bounty",error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Errror"
        }, {status : 500})
    }
}
