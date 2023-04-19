import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
	{
		order_id: {
			type: String,
			required: true,
		},
		tenant_id: {
			type: String,
			required: true,
		},
		order_status: {
			type: Number,
			required: true,
		},
		order_state: {
			type: String,
			required: true,
		},
		order_channel: {
			type: String,
			required: true,
		},
		order_online_id: {
			type: String,
			required: false,
		},
		order_pin: {
			type: String,
			required: false,
		},
		order_table: {
			type: String,
			required: true,
		},
		order_table_index: {
			type: Number,
			required: true,
		},
		order_time: {
			type: String,
			required: true,
		},
		order_menu: [{ type: {}, required: false }],
		order_paid: {
			type: Boolean,
			default: false,
		},
		order_item: {
			type: Number,
			required: true,
		},
		order_servicecharge: {
			type: Number,
			required: true,
		},
		order_taxcharge: {
			type: Number,
			required: true,
		},
		order_total: {
			type: Number,
			required: true,
		},
		user_id: {
			type: String,
			required: true,
		},
		user_name: {
			type: String,
			required: false,
			default: '',
		},
		user_phonenumber: {
			type: String,
			required: false,
			default: '',
		},
		order_instruction: {
			type: String,
			required: false,
			default: '',
		},
		user_guest: {
			type: String,
			required: false,
			default: '',
		},
		reject_reason: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
