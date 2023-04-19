import mongoose from 'mongoose';

const tenantSchema = mongoose.Schema(
	{
		tenant_id: {
			type: String,
			required: true,
		},
		foodcourt_id: {
			type: String,
			required: true,
			default: '-',
		},
		foodcourt_name: {
			type: String,
			required: true,
			default: '-',
		},
		partner_id: {
			type: String,
			required: true,
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
		profileImage: {
			type: String,
			default: 'https://backend.oasis-one.com/api/images/avatar/render/default_avatar.jpg',
		},
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		location: {
			type: String,
			default: 'please input location',
		},
		address: {
			type: String,
			default: 'please input detail address',
		},
		phoneNumber: {
			type: String,
			default: 'please input phone number',
		},
		password: {
			type: String,
			required: true,
		},
		uniqueKey: {
			type: String,
		},
		contract_Name: {
			type: String,
		},
		verified: {
			type: Boolean,
		},
		profileColor: {
			type: String,
			default: '#424242',
		},
		taxCharge: {
			type: Number,
			required: true,
			default: 10,
		},
		serviceCharge: {
			type: Number,
			required: true,
			default: 10,
		},
		isOperational: {
			type: Boolean,
			required: true,
			default: false,
		},
		qrCode: {
			type: String,
		},
		termOfServiceAccepted: {
			type: Boolean,
			default: false,
		},
		openingDays: [
			{
				day: { type: String, default: 'Monday' },
				is24Hours: { type: Boolean, default: false },
				isClosed: { type: Boolean, default: false },
				OpenHour: { type: String, default: '00' },
				OpenMins: { type: String, default: '00' },
				OpenTF: { type: String, default: 'AM' },
				CloseHour: { type: String, default: '00' },
				CloseMins: { type: String, default: '00' },
				CloseTF: { type: String, default: 'PM' },
			},
			{
				day: { type: String, default: 'Tuesday' },
				is24Hours: { type: Boolean, default: false },
				isClosed: { type: Boolean, default: false },
				OpenHour: { type: String, default: '00' },
				OpenMins: { type: String, default: '00' },
				OpenTF: { type: String, default: 'AM' },
				CloseHour: { type: String, default: '00' },
				CloseMins: { type: String, default: '00' },
				CloseTF: { type: String, default: 'PM' },
			},
			{
				day: { type: String, default: 'Wednesday' },
				is24Hours: { type: Boolean, default: false },
				isClosed: { type: Boolean, default: false },
				OpenHour: { type: String, default: '00' },
				OpenMins: { type: String, default: '00' },
				OpenTF: { type: String, default: 'AM' },
				CloseHour: { type: String, default: '00' },
				CloseMins: { type: String, default: '00' },
				CloseTF: { type: String, default: 'PM' },
			},
			{
				day: { type: String, default: 'Thursday' },
				is24Hours: { type: Boolean, default: false },
				isClosed: { type: Boolean, default: false },
				OpenHour: { type: String, default: '00' },
				OpenMins: { type: String, default: '00' },
				OpenTF: { type: String, default: 'AM' },
				CloseHour: { type: String, default: '00' },
				CloseMins: { type: String, default: '00' },
				CloseTF: { type: String, default: 'PM' },
			},
			{
				day: { type: String, default: 'Friday' },
				is24Hours: { type: Boolean, default: false },
				isClosed: { type: Boolean, default: false },
				OpenHour: { type: String, default: '00' },
				OpenMins: { type: String, default: '00' },
				OpenTF: { type: String, default: 'AM' },
				CloseHour: { type: String, default: '00' },
				CloseMins: { type: String, default: '00' },
				CloseTF: { type: String, default: 'PM' },
			},
			{
				day: { type: String, default: 'Saturday' },
				is24Hours: { type: Boolean, default: false },
				isClosed: { type: Boolean, default: false },
				OpenHour: { type: String, default: '00' },
				OpenMins: { type: String, default: '00' },
				OpenTF: { type: String, default: 'AM' },
				CloseHour: { type: String, default: '00' },
				CloseMins: { type: String, default: '00' },
				CloseTF: { type: String, default: 'PM' },
			},
			{
				day: { type: String, default: 'Sunday' },
				is24Hours: { type: Boolean, default: false },
				isClosed: { type: Boolean, default: false },
				OpenHour: { type: String, default: '00' },
				OpenMins: { type: String, default: '00' },
				OpenTF: { type: String, default: 'AM' },
				CloseHour: { type: String, default: '00' },
				CloseMins: { type: String, default: '00' },
				CloseTF: { type: String, default: 'PM' },
			},
		],
	},
	{
		timestamps: true,
		strict: false,
	}
);

tenantSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (doc, ret) {
		delete ret._id;
		delete ret.id;
		delete ret.password;
	},
});

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
