import { Decimal128 } from 'mongodb';
import mongoose from 'mongoose';

const performanceSchema = mongoose.Schema(
	{
		tenant_id: {
			type: String,
			required: true,
		},
		performance: [
			{
				date: {
					type: Date,
					default: '',
				},
				net_income: {
					type: Number,
					default: '',
				},
				avg_income: {
					type: Number,
					default: '',
				},
				total_income: {
					type: Number,
					default: '',
				},
				pct_income: {
					type: Number,
					default: 0,
				},
				net_sold: {
					type: Number,
					default: 0,
				},
				avg_sold: {
					type: Number,
					default: 0,
				},
				total_sold: {
					type: Number,
					default: 0,
				},
				pct_sold: {
					type: Number,
					default: 0,
				},
				net_count: {
					type: Number,
					default: 0,
				},
				avg_count: {
					type: Number,
					default: 0,
				},
				total_count: {
					type: Number,
					default: 0,
				},
				pct_count: {
					type: Number,
					default: 0,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

const Performance = mongoose.model('Performance', performanceSchema);

export default Performance;
