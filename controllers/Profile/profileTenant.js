import Tenant from '../../models/tenantModel.js';

async function GetTenantDetails(req, res) {
	try {
		const { tenant_id } = req.params;

		// Find Tenant
		const checkTenant = await Tenant.findOne({ tenant_id });

		if (checkTenant) {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Tenant has been found',
				data: checkTenant,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Tenant is not found',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function GetTenantByEmail(req, res) {
	try {
		const { email } = req.params;

		// Find Tenant
		const checkTenant = await Tenant.findOne({ email: email });

		if (checkTenant) {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Tenant has been found',
				data: checkTenant,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Tenant is not found',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function EditProfile(req, res) {
	try {
		const { tenant_id } = req.params;
		const {
			profileName,
			profileColor,
			location,
			address,
			profileImage,
			phoneNumber,
			email,
			isOperational,
		} = req.body;

		// Find Tenant
		const checkTenant = await Tenant.findOne({ tenant_id });

		if (checkTenant) {
			if (profileName) {
				checkTenant.name = profileName;
			}
			if (profileColor) {
				checkTenant.profileColor = profileColor;
			}
			if (location) {
				checkTenant.location = location;
			}
			if (address) {
				checkTenant.address = address;
			}
			if (profileImage) {
				checkTenant.profileImage = profileImage;
			}
			if (phoneNumber) {
				checkTenant.phoneNumber = phoneNumber;
			}
			if (email) {
				checkTenant.email = email;
			}
			if (isOperational == true) {
				checkTenant.isOperational = true;
			}
			if (isOperational == false) {
				checkTenant.isOperational = false;
			}
			await checkTenant.save();

			const getUpdatedTenant = await Tenant.findOne({ tenant_id });
			if (getUpdatedTenant) {
				return res.status(200).json({
					status: 'SUCCESS',
					message: 'Profile has been edited',
					data: getUpdatedTenant,
				});
			}
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Profile is not found',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function EditTaxCharge(req, res) {
	try {
		const { tenant_id, charges } = req.body;

		// Find Tenant
		const checkTenant = await Tenant.findOne({ tenant_id });

		if (checkTenant) {
			checkTenant.taxCharge = charges;
			await checkTenant.save();

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Tax charges has been changed',
				data: checkTenant,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Tenant is not found',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function EditServiceCharge(req, res) {
	try {
		const { tenant_id, charges } = req.body;

		// Find Tenant
		const checkTenant = await Tenant.findOne({ tenant_id });

		if (checkTenant) {
			checkTenant.serviceCharge = charges;
			await checkTenant.save();

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Service charges has been changed',
				data: checkTenant,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Tenant is not found',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function EditOpeningHours(req, res) {
	try {
		const { tenant_id } = req.params;
		const {
			day,
			is24Hours,
			isClosed,
			OpenHour,
			OpenMins,
			OpenTF,
			CloseHour,
			CloseMins,
			CloseTF,
		} = req.body;

		let index = 0;
		if (day == 'Monday') {
			index = 0;
		} else if (day == 'Tuesday') {
			index = 1;
		} else if (day == 'Wednesday') {
			index = 2;
		} else if (day == 'Thursday') {
			index = 3;
		} else if (day == 'Friday') {
			index = 4;
		} else if (day == 'Saturday') {
			index = 5;
		} else if (day == 'Sunday') {
			index = 6;
		} else {
			index = 7;
		}

		const checkTenant = await Tenant.findOne(
			{ tenant_id },
			{
				openingDays: { day: day },
			}
		);

		if (checkTenant) {
			checkTenant.openingDays[index].is24Hours = is24Hours;
			checkTenant.openingDays[index].isClosed = isClosed;
			checkTenant.openingDays[index].OpenHour = OpenHour;
			checkTenant.openingDays[index].OpenMins = OpenMins;
			checkTenant.openingDays[index].OpenTF = OpenTF;
			checkTenant.openingDays[index].CloseHour = CloseHour;
			checkTenant.openingDays[index].CloseMins = CloseMins;
			checkTenant.openingDays[index].CloseTF = CloseTF;
			await checkTenant.save();

			const retrieveLatestTenant = await Tenant.findOne({ tenant_id });

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Service charges has been changed',
				data: retrieveLatestTenant,
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

export {
	EditProfile,
	EditTaxCharge,
	EditServiceCharge,
	EditOpeningHours,
	GetTenantDetails,
	GetTenantByEmail,
};
