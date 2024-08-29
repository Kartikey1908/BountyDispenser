import GithubProvider from "next-auth/providers/github";
import { User as NextAuthuser, Account } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";


export const authOptions = {
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      }),
    ],
    callbacks: {
      async signIn({ user, account, profile }: { user: NextAuthuser; account: Account | null; profile?: any }) {
        await dbConnect();
  
        const existingUser = await User.findOne({ github_id: user.id });
        // console.log({user, account, profile})
  
        try {
          if (!existingUser) {
            const newUser = await User.create({
              github_id: user.id,
              github_username: profile.login || '',
              wallet_address: '', 
              pending_amount: '0',
              locked_amount: '0',
            });
            if (account)
              account._id = newUser._id;
          }
          else {
            if (account)
              account._id = existingUser._id;
          }
        } catch (error) {
          console.error("Error creating user:", error);
        }
        
        return true;
      },
      
      async jwt({ token, account, profile }: { token: any; account: Account | null; profile?: any }) {
        if (account) {
          token.accessToken = account.access_token;
          token.provider = account.provider;
          token._id = account._id
        }
  
        if (profile) {
          token.profile = profile;
        }
        return token; 
      },
  
      async session({session, token} : {session: any; token: any}){
        session.accessToken = token.accessToken;
        session.user.profile = token.profile;
        session._id = token._id;
        // console.log(session.user);
        return session;
      },
      
    },
  };
