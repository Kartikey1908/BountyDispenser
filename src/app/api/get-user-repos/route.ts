import axios from 'axios';
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from '../auth/[...nextauth]/options';

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

        const response = await axios.get("https://api.github.com/user/repos?simple=yes&per_page=200&page=1", {
            headers: {
              Authorization: `token ${session.accessToken}`,
            },
        });

        const repos = response.data.filter((repo : any) => repo.owner.login === session.user.profile.login)
          
        // // console.log("repos", response.data);


        if (!repos) {
            return NextResponse.json({
                success: false,
                message: "No repos found"
            }, {status : 401})
        }

        return NextResponse.json({
            success: true,
            message: "All repos fetched successfully", 
            repos: repos,
        }, {status : 200})


    } catch (error) {
        // console.log("Error occured while creating new bounty",error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Errror"
        }, {status : 500})
    }
}
