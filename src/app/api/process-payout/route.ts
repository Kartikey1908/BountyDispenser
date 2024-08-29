import dbConnect from "@/lib/dbConnect";
import bs58 from "bs58";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {  Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
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

    // const userId = session._id;
    const userId = session._id;
    // const userId = "66cb8c08f4b5584be80a942a";

    // console.log("Session user", userId);
    // // console.log(session);


    try {
        await dbConnect();
        // console.log("Connected to database");

        const { publicKey } = await req.json();

        if (!publicKey) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields",
            }, { status: 400 }
        )};

        // const publicKey = "EnCYWZurWXDqSDcsCE4pzJiECnCGGFnaybAjPQTs7R7g"


        const userData = await User.findById(userId);

        if (!userData) {
            return NextResponse.json({
                success: false,
                message: "User does not exist"
            }, {status: 404}
        )};

        if (userData.pending_amount === "0") {
            return NextResponse.json({
                success: false,
                message: "No pending amount to process"
            }, {status: 400}
        )};

        userData.locked_amount = (Number(userData.locked_amount) + Number(userData.pending_amount)).toString();

        userData.pending_amount = "0";
        userData.save();

        const amount = userData?.locked_amount;

        const connection = new Connection(process.env.CONNECTION_URL as string, 'confirmed');
        const parentKeypair = Keypair.fromSecretKey(bs58.decode(process.env.PARENT_WALLET_PRIVATE_KEY as string));
        const recipientPublicKey = new PublicKey(publicKey);
  

        // console.log(amount);
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: parentKeypair.publicKey,
                toPubkey: recipientPublicKey,
                lamports: Number(amount),
            })
        );

        // TODO: cut extra 5000 lamports for fees
        const signature = await sendAndConfirmTransaction(connection, transaction, [parentKeypair]);
        // console.log("Transaction signature", signature);

        userData.locked_amount = "0";
        userData.save();

        

        return NextResponse.json({
            success: true,
            message: "Payout processed successfully", 
            amount : String(amount / LAMPORTS_PER_SOL),
        }, {status : 200})


    } catch (error) {
        try {
            const user = await User.findById(userId);
            if (user) {
                user.pending_amount = user.locked_amount;
                user.locked_amount = "0";
                user.save();
                // console.log("Error occured while creating new bounty",error);
            }
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: "Internal Server Errror"
            }, {status : 500})
        }
        
        return NextResponse.json({
            success: false,
            message: "Internal Server Errror"
        }, {status : 500})
    }
}
