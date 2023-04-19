import mongoose from "mongoose";

const paymentSchema = mongoose.Schema(
	{
		order_id	: {
			type		: String,
			required	: true, 
		},
		payment_amount	: {
			type 		: Number,
			required	: true,
		},
		payment_status	: {
			type		: String,
			required	: true,
			default		: "NULL",
		},
		payment_signature	: {
			type		: String,
			required	: true,
			default		: "NULL",
		}
	},
	{
		timestamps: true,
	}
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
