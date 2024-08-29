import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import User from '@/model/User';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from "@/lib/dbConnect";

export async function GET(req : NextRequest, res : NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized access",
        }, {status: 403});
    }

    const userId = session._id;


    try {
        await dbConnect();

        const userData = await User.findById(userId);

        if (!userData) {
            return NextResponse.json({
                success: false,
                message: "User does not exists",
            }, {status: 403})
        }
        console.log("Balance before", userData.pending_amount);
        const balance = (Number(userData.pending_amount) / LAMPORTS_PER_SOL)  ? (Number(userData.pending_amount) / LAMPORTS_PER_SOL).toString() : "0";
        console.log("Balance", balance);

        return NextResponse.json({
            success: true,
            message: "User Balance fetched successfully",
            userBalance: balance,
        })

    } catch (error) {
        console.log("Error occured while fetching user balance",error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Errror"
        }, {status : 500})
    }
}
