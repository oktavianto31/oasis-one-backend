import Foodcourt from '../../models/foodcourtModel.js';
import Tenant from '../../models/tenantModel.js';
import getRandomString from 'randomstring';

async function createFoodcourt(req, res) {
	try {
		const {
			foodcourt_address,
			foodcourt_location,
			foodcourt_name,
			foodcourt_color,
		} = req.body;
		let id;

		let tempId = getRandomString.generate(8);
		const existingId = await Foodcourt.findOne({
			foodcourt_id: 'F-' + tempId,
		});

		if (existingId) {
			tempId = new getRandomString.generate(8);
			return tempId;
		}
		id = 'F-' + tempId;

		const QRlink = 'https://user.oasis-one.com/foodcourt/' + id;

		const newFoodcourt = new Foodcourt({
			foodcourt_id: id,
			foodcourt_name: foodcourt_name,
			foodcourt_color: foodcourt_color,
			foodcourt_location: foodcourt_location,
			foodcourt_address: foodcourt_address,
			qrCode: QRlink,
		});
		await newFoodcourt.save();

		const checkFoodcourt = await Foodcourt.aggregate([
			{ $match: { foodcourt_id: id } },
			{ $sort: { foodcourt_name: -1 } },
		]);

		if (checkFoodcourt) {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt created successfully',
				data: checkFoodcourt,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Foodcourt failed to be created',
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

async function retrieveFoodCourt(req, res) {
	try {
		const checkFoodcourt = await Foodcourt.aggregate([
			{ $sort: { createdAt: -1 } },
		]);

		if (checkFoodcourt) {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Foodcourt failed to be retrieved',
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

async function retrieveFoodCourtbyID(req, res) {
	try {
		const { foodcourt_id } = req.params;

		const checkFoodcourt = await Foodcourt.aggregate([
			{ $match: { foodcourt_id: foodcourt_id } },
			{ $sort: { foodcourt_name: -1 } },
		]);

		if (checkFoodcourt) {
			checkFoodcourt[0].tenant_list.map(async (item, index) => {
				const retrieveTenantData = await Tenant.findOne({
					tenant_id: item.tenant_id,
				});

				await Foodcourt.aggregate([
					{ $match: { foodcourt_id: foodcourt_id } },
					{ $unwind: '$tenant_list' },
					{ $match: { 'tenant_list.tenant_id': item.tenant_id } },
					{
						$set: {
							tenant_list: {
								tenant_id: item.tenant_id,
								tenant_name: retrieveTenantData.name,
								tenant_address: retrieveTenantData.address,
								tenant_location: retrieveTenantData.location,
							},
						},
					},
					{ $sort: { foodcourt_name: -1 } },
				]);
			});

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Foodcourt failed to be retrieved',
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

async function FoodcourtAlphabetSort(req, res) {
	try {
		const { sortingMethod } = req.params;

		if (sortingMethod == 'ascending') {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $sort: { foodcourt_name: 1 } },
			]);

			console.log('Foodcourt', checkFoodcourt);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
			});
		} else {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $sort: { foodcourt_name: -1 } },
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
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

async function FoodcourtAddressSort(req, res) {
	try {
		const { sortingMethod } = req.params;

		if (sortingMethod == 'ascending') {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $sort: { foodcourt_address: 1 } },
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
			});
		} else {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $sort: { foodcourt_address: -1 } },
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
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

async function FoodcourtLocationSort(req, res) {
	try {
		const { sortingMethod } = req.params;

		if (sortingMethod == 'ascending') {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $sort: { foodcourt_location: 1 } },
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
			});
		} else {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $sort: { foodcourt_location: -1 } },
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
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

async function FoodcourtTenantAlphabetSort(req, res) {
	try {
		const { sortingMethod, foodcourt_id } = req.params;

		if (sortingMethod == 'ascending') {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $match: { foodcourt_id } },
				{ $unwind: '$tenant_list' },
				{ $sort: { 'tenant_list.tenant_name': 1 } },
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
			});
		} else {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $match: { foodcourt_id } },
				{ $unwind: '$tenant_list' },
				{ $sort: { 'tenant_list.tenant_name': -1 } },
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
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

async function FoodcourtTenantAddressSort(req, res) {
	try {
		const { sortingMethod, foodcourt_id } = req.params;

		if (sortingMethod == 'ascending') {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $match: { foodcourt_id } },
				{ $unwind: '$tenant_list' },
				{ $sort: { 'tenant_list.tenant_address': 1 } },
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
			});
		} else {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $match: { foodcourt_id } },
				{ $unwind: '$tenant_list' },
				{ $sort: { 'tenant_list.tenant_address': -1 } },
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
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

async function FoodcourtTenantLocationSort(req, res) {
	try {
		const { sortingMethod, foodcourt_id } = req.params;

		if (sortingMethod == 'ascending') {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $match: { foodcourt_id } },
				{ $unwind: '$tenant_list' },
				{ $sort: { 'tenant_list.tenant_location': 1 } },
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
			});
		} else {
			const checkFoodcourt = await Foodcourt.aggregate([
				{ $match: { foodcourt_id } },
				{ $unwind: '$tenant_list' },
				{ $sort: { 'tenant_list.tenant_location': -1 } },
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt retrieved successfully',
				data: checkFoodcourt,
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

async function editFoodcourt(req, res) {
	try {
		const { foodcourt_id } = req.params;
		const {
			foodcourt_address,
			foodcourt_location,
			foodcourt_name,
			foodcourt_color,
			foodcourt_logo,
		} = req.body;

		const existingFoodcourt = await Foodcourt.findOne({ foodcourt_id });

		if (existingFoodcourt) {
			if (foodcourt_address) {
				existingFoodcourt.foodcourt_address = foodcourt_address;
			}

			if (foodcourt_color) {
				existingFoodcourt.foodcourt_color = foodcourt_color;
			}

			if (foodcourt_logo) {
				existingFoodcourt.foodcourt_logo = foodcourt_logo;
			}

			if (foodcourt_location) {
				existingFoodcourt.foodcourt_location = foodcourt_location;
			}

			if (foodcourt_name) {
				existingFoodcourt.foodcourt_name = foodcourt_name;
			}
		}
		await existingFoodcourt.save();

		const checkFoodcourt = await Foodcourt.aggregate([
			{ $match: { foodcourt_id: foodcourt_id } },
			{ $sort: { foodcourt_name: -1 } },
		]);

		if (checkFoodcourt) {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Foodcourt saved successfully',
				data: checkFoodcourt,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Foodcourt failed to be saved',
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

async function deleteFoodcourt(req, res) {
	try {
		const { foodcourt_id } = req.params;
		const existingFoodcourt = await Foodcourt.findOne({ foodcourt_id });

		if (existingFoodcourt) {
			if (existingFoodcourt.tenant_list.length > 0) {
				existingFoodcourt.tenant_list.map(async (item, index) => {
					await Tenant.updateOne(
						{ tenant_id: item.tenant_id },
						{
							$set: {
								foodcourt_id: '-',
								foodcourt_name: '-',
							},
						}
					);
				});
			}

			const deleteFoodcourt = await Foodcourt.deleteOne({ foodcourt_id });
			if (deleteFoodcourt) {
				return res.status(200).json({
					status: 'SUCCESS',
					message: 'Foodcourt has been deleted',
				});
			} else {
				return res.status(404).json({
					status: 'FAILED',
					message: 'Foodcourt failed to be deleted',
				});
			}
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Foodcourt does not exists',
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

async function addTenant(req, res) {
	try {
		const { foodcourt_id } = req.params;
		const { tenant_id } = req.body;

		const existingFoodcourt = await Foodcourt.findOne({ foodcourt_id });

		if (existingFoodcourt) {
			const existingTenant = await Tenant.findOne({ tenant_id });

			if (existingTenant) {
				const updateFoodcourt = await Foodcourt.updateOne(
					{ foodcourt_id },
					{
						$push: {
							tenant_list: {
								tenant_id,
								tenant_name: existingTenant.name,
								tenant_address: existingTenant.address,
								tenant_location: existingTenant.location,
							},
						},
					}
				);

				await Tenant.updateOne(
					{ tenant_id },
					{
						$set: {
							foodcourt_id: foodcourt_id,
							foodcourt_name: existingFoodcourt.foodcourt_name,
						},
					}
				);

				if (updateFoodcourt) {
					const checkFoodcourt = await Foodcourt.aggregate([
						{ $match: { foodcourt_id: foodcourt_id } },
						{ $sort: { foodcourt_name: -1 } },
					]);

					return res.status(200).json({
						status: 'SUCCESS',
						message: 'Foodcourt updated successfully',
						data: checkFoodcourt,
					});
				} else {
					return res.status(404).json({
						status: 'FAILED',
						message: 'Foodcourt failed to update',
					});
				}
			} else {
				return res.status(404).json({
					status: 'FAILED',
					message: 'Tenant does not exists',
				});
			}
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Foodcourt does not exists',
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

async function removeTenant(req, res) {
	try {
		const { foodcourt_id } = req.params;
		const { tenant_id } = req.body;

		const existingFoodcourt = await Foodcourt.findOne({ foodcourt_id });

		if (existingFoodcourt) {
			const existingTenant = await Tenant.findOne({ tenant_id });

			if (existingTenant) {
				const updateFoodcourt = await Foodcourt.updateOne(
					{ foodcourt_id },
					{
						$pull: {
							tenant_list: {
								tenant_id: tenant_id,
								tenant_name: existingTenant.name,
								tenant_address: existingTenant.address,
								tenant_location: existingTenant.location,
							},
						},
					}
				);

				await Tenant.updateOne(
					{ tenant_id },
					{
						$set: {
							foodcourt_id: '-',
							foodcourt_name: '-',
						},
					}
				);

				if (updateFoodcourt) {
					const checkFoodcourt = await Foodcourt.aggregate([
						{ $match: { foodcourt_id: foodcourt_id } },
						{ $sort: { foodcourt_name: -1 } },
					]);

					return res.status(200).json({
						status: 'SUCCESS',
						message: 'Foodcourt updated successfully',
						data: checkFoodcourt,
					});
				} else {
					return res.status(404).json({
						status: 'FAILED',
						message: 'Foodcourt failed to update',
					});
				}
			} else {
				return res.status(404).json({
					status: 'FAILED',
					message: 'Tenant does not exists',
				});
			}
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Foodcourt does not exists',
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
	createFoodcourt,
	retrieveFoodCourt,
	retrieveFoodCourtbyID,
	FoodcourtAlphabetSort,
	FoodcourtAddressSort,
	FoodcourtLocationSort,
	FoodcourtTenantAlphabetSort,
	FoodcourtTenantAddressSort,
	FoodcourtTenantLocationSort,
	editFoodcourt,
	deleteFoodcourt,
	addTenant,
	removeTenant,
};
