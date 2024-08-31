// pages/api/getBounties.js
import dbConnect from '@/lib/dbConnect';
import Bounty from '@/model/Bounty';
import User from '@/model/User';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(req : NextRequest, res : NextResponse) {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') as string
    const limit = searchParams.get('limit') as string

  // Parse the page and limit, or set defaults
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 100;
  console.log({pageNumber, pageSize});

  try {
    await dbConnect();

    // Calculate the offset for pagination
    const skip = (pageNumber - 1) * pageSize;

    // Fetch the bounties from the database
    await User.find({});
    const bounties = await Bounty
      .find({})
      .sort({ created_at: -1 }) // Assuming you want the most recent bounties first
      .skip(skip)
      .limit(pageSize)
      .populate('created_by', 'github_username',);

      console.log("Data fetched from db", bounties);

      return NextResponse.json({
          success: true,
          message: "Bounties fetched",
          bounties : bounties
      }, {status: 200})
  } catch (error) {
    console.log("Error occured while fetching bounties", error);
    return NextResponse.json({
        success: false,
        message: "Error occured while fetching bounties",
    }, {status: 500})
  }
}
