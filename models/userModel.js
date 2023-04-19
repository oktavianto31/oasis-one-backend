import mongoose from "mongoose";

const userSchema = mongoose.Schema(
	{
		user_id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: false,
			default: '-',
		},
		phoneNumber: {
			type: String,
			required: false,
			default: '-',
		},
		telegram_username: {
			type: String,
			required: true,
			default: '-',
		},
		telegram_userid: {
			type: String,
			required: true,
			default: '-',
		},
		history: [
			{
				order_id: {
					type: String,
					required: false,
				},
				lastOrder: {
					type: Date,
					required: false,
				},
				tenant_id: {
					type: String,
					required: false,
				},
				tenant_name: {
					type: String,
					required: false,
				},
				order_channel: {
					type: String,
					required: true,
				},
				order_online_id: {
					type: String,
					required: false,
				},
				order_table: {
					type: String,
					required: false,
				},
				order_total: {
					type: Number,
					required: false,
				},
				user_guest: {
					type: Number,
					required: false,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.id;
  },
});


const User = mongoose.model("User", userSchema);

export default User;