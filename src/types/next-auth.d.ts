// import NextAuth, { Profile, User } from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     _id?: string,
//     accessToken?: string; // Extend the Session type to include accessToken
//     user: {
//       image? : string,
//       name? : string,
//       email? : string,
//       profile? : any
//     }
    
//   }
// }

import NextAuth, { Profile, User } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string; // Extend the Session type to include accessToken
    user: {
      image? : string,
      name? : string,
      email? : string,
      profile? : any
    }
    
  }
}
