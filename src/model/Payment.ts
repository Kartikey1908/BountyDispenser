import mongoose, {Schema, Document} from "mongoose";
import { User } from "./User";

export interface Payment extends Document {
    amount: string, 
    payment_status: string,
    transaction_id : string,
    blockhash: string,
}

const PaymentSchema: Schema<Payment> = new Schema({
    amount: {
        type: String, 
        required: true,
    },
    payment_status: {
        type: String, 
        required: true,
    },
    transaction_id: {
        type: String, 
        required: true,
    },
    blockhash: {
        type: String, 
        required: true,
    },
});

export default mongoose.model<Payment>("Payment", PaymentSchema);
