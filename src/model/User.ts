import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
    github_id: string;
    github_username: string;
    access_token: string;
    wallet_address: string;
    pending_amount: string;
    locked_amount: string;
}

const UserSchema: Schema<User> = new Schema({
    github_id: {
        type: String,
        required: true,
    },
    github_username: {
        type: String,
        required: true,
    },
    wallet_address: {
        type: String,
    },
    pending_amount: {
        type: String,
        default: "0",
    },
    locked_amount: {
        type: String,
        default: "0",
    },
});

const User = mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default User;
