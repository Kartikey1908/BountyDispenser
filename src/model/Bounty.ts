import mongoose, { Schema, Document } from "mongoose";
import { User } from "./User"; 



export interface Bounty extends Document {
    amount: string;
    repo_name: string;
    issue_number: string;
    created_by: User;
    created_at: Date;
    title: string,
    body: string,
    signature: string,
    publicKey: string,
    status: string
}

const BountySchema: Schema<Bounty> = new Schema({
    amount: {
        type: String,
        required: true,
    },
    repo_name: {
        type: String,
        required: true,
    },
    issue_number: {
        type: String,
        required: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
    },
    signature: {
        type: String,
        required: true,
    },
    publicKey: {
        type: String,
        required: true,
    },
    status: {
        type:String,
        enum: ["open", "closed"],
        default: "open",
    }
});

const Bounty = mongoose.models.Bounty || mongoose.model<Bounty>("Bounty", BountySchema);

export default Bounty;
