import Menu from '../../models/menuModel.js';
import { generateRandomNumber } from '../../middlewares/randomizer.js';

// Create Category
async function CreateCategories(req, res) {
	try {
		const { tenant_id } = req.params;
		const { cat_name } = req.body;

		// Category ID
		let cat_id;
		const generateID = () => generateRandomNumber(3);
		let tempId = generateID();

		const existingId = await Menu.findOne({
			'category.id': 'C-' + tempId,
		});

		if (existingId) {
			tempId = generateID();
			return tempId;
		}
		cat_id = 'C-' + tempId;

		const existingTenant = await Menu.findOne({
			tenant_id: tenant_id,
		});

		if (!existingTenant) {
			const newMenu = new Menu({
				tenant_id: tenant_id,
				category: [
					{
						id: cat_id,
						index: 1,
						name: cat_name,
					},
				],
			});
			await newMenu.save();

			if (newMenu) {
				const RetrieveLatestMenu = await Menu.aggregate([
					{ $match: { tenant_id: tenant_id } },
					{ $unwind: '$category' },
					{ $sort: { 'category.index': 1 } },
					{
						$project: {
							_id: 0,
							category: 1,
						},
					},
				]);

				return res.status(200).json({
					status: 'SUCCESS',
					message: 'New category has been created',
					data: RetrieveLatestMenu,
				});
			} else {
				return res.status(404).json({
					status: 'FAILED',
					message: 'New category failed to be created',
				});
			}
		}

		const notExistingMenu = await Menu.findOne({
			$and: [
				{ tenant_id: tenant_id },
				{ 'category.name': { $ne: cat_name } },
			],
		});

		const amount = await Menu.aggregate([
			{ $match: { tenant_id: tenant_id } },
			{
				$project: {
					_id: 0,
					count: { $size: '$category' },
				},
			},
		]);

		if (existingTenant && notExistingMenu) {
			console.log('tenant', amount[0].count);

			if (amount[0].count == 0) {
				await Menu.updateOne(
					{
						tenant_id: tenant_id,
					},
					{
						$push: {
							category: {
								id: cat_id,
								index: 1,
								name: cat_name,
							},
						},
					}
				);

				const RetrieveLatestMenu = await Menu.aggregate([
					{ $match: { tenant_id: tenant_id } },
					{ $unwind: '$category' },
					{ $sort: { 'category.index': 1 } },
					{
						$project: {
							_id: 0,
							category: 1,
						},
					},
				]);

				if (RetrieveLatestMenu) {
					return res.status(200).json({
						status: 'SUCCESS',
						message: 'Category has been created',
						data: RetrieveLatestMenu,
					});
				} else {
					return res.status(404).json({
						status: 'FAILED',
						message: 'Category has not been created',
					});
				}
			}

			for (let j = 1; j <= amount[0].count; j++) {
				let notExistingIndex = await Menu.findOne({
					$and: [
						{ tenant_id: tenant_id },
						{ 'category.index': { $ne: j } },
					],
				});

				while (notExistingIndex != null) {
					await Menu.updateOne(
						{
							tenant_id: tenant_id,
						},
						{
							$push: {
								category: {
									id: cat_id,
									index: j,
									name: cat_name,
								},
							},
						}
					);

					const RetrieveLatestMenu = await Menu.aggregate([
						{ $match: { tenant_id: tenant_id } },
						{ $unwind: '$category' },
						{ $sort: { 'category.index': 1 } },
						{
							$project: {
								_id: 0,
								category: 1,
							},
						},
					]);

					if (RetrieveLatestMenu) {
						return res.status(200).json({
							status: 'SUCCESS',
							message: 'Category has been created',
							data: RetrieveLatestMenu,
						});
					} else {
						return res.status(404).json({
							status: 'FAILED',
							message: 'Category has not been created',
						});
					}
				}

				if (j == amount[0].count) {
					await Menu.updateOne(
						{
							tenant_id: tenant_id,
						},
						{
							$push: {
								category: {
									id: cat_id,
									index: amount[0].count + 1,
									name: cat_name,
								},
							},
						}
					);

					const RetrieveLatestMenu = await Menu.aggregate([
						{ $match: { tenant_id: tenant_id } },
						{ $unwind: '$category' },
						{ $sort: { 'category.index': 1 } },
						{
							$project: {
								_id: 0,
								category: 1,
							},
						},
					]);

					if (RetrieveLatestMenu) {
						return res.status(200).json({
							status: 'SUCCESS',
							message: 'Category has been created',
							data: RetrieveLatestMenu,
						});
					} else {
						return res.status(404).json({
							status: 'FAILED',
							message: 'Category has not been created',
						});
					}
				}
			}
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Category exists',
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

// Get Category
async function GetCategory(req, res) {
	try {
		const { tenant_id } = req.params;

		const checkCategory = await Menu.aggregate([
			{ $match: { tenant_id: tenant_id } },
			{ $unwind: '$category' },
			{ $sort: { 'category.index': 1 } },

			{
				$project: {
					_id: 0,
					category: 1,
				},
			},
		]);

		if (checkCategory) {
			const RetrieveLatestMenu = await Menu.aggregate([
				{ $match: { tenant_id: tenant_id } },
				{ $unwind: '$category' },
				{ $sort: { 'category.index': 1 } },

				{
					$project: {
						_id: 0,
						category: 1,
					},
				},
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Category has been retrieved',
				data: RetrieveLatestMenu,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Category has not been retrieved',
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

// Edit Category Name
async function EditCategory(req, res) {
	try {
		const { tenant_id } = req.params;
		const { cat_id, cat_name } = req.body;

		const existingMenu = await Menu.findOne({
			$and: [
				{ tenant_id: tenant_id },
				{ 'category.id': cat_id },
				{ 'category.name': { $ne: cat_name } },
			],
		});

		if (existingMenu) {
			const updateMenu = await Menu.updateOne(
				{
					'category.id': cat_id,
				},
				{
					$set: {
						'category.$.name': cat_name,
					},
				}
			);

			if (updateMenu) {
				const RetrieveLatestMenu = await Menu.aggregate([
					{ $match: { tenant_id: tenant_id } },
					{ $unwind: '$category' },
					{ $sort: { 'category.index': 1 } },
					{
						$project: {
							_id: 0,
							category: 1,
						},
					},
				]);

				return res.status(200).json({
					status: 'SUCCESS',
					message: 'Category has been updated',
					data: RetrieveLatestMenu,
				});
			} else {
				return res.status(404).json({
					status: 'FAILED',
					message: 'Category failed to be updated',
				});
			}
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Category name has been used',
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

// Edit Category Index
async function EditCategoryIndex(req, res) {
	try {
		const { tenant_id } = req.params;
		const { cat_id, cat_index } = req.body;

		const existingMenu = await Menu.findOne({
			$and: [{ tenant_id: tenant_id }, { 'category.id': cat_id }],
		});

		if (existingMenu) {
			await Menu.updateOne(
				{
					'category.id': cat_id,
				},
				{
					$set: {
						'category.$.index': cat_index,
					},
				}
			);

			const RetrieveLatestMenu = await Menu.aggregate([
				{ $match: { tenant_id: tenant_id } },
				{ $unwind: '$category' },
				{ $sort: { 'category.index': 1 } },
				{
					$project: {
						_id: 0,
						category: 1,
					},
				},
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Category has been updated',
				data: RetrieveLatestMenu,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Category name has been used',
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

// Delete Category
async function DeleteCategory(req, res) {
	try {
		const { tenant_id, cat_id } = req.params;

		const checkCategory = await Menu.findOne({
			'category.id': cat_id,
		});

		if (checkCategory) {
			const deleteCategory = await Menu.updateOne(
				{
					'category.id': cat_id,
				},
				{
					$pull: {
						category: { id: cat_id },
					},
				}
			);

			if (deleteCategory) {
				const RetrieveLatestMenu = await Menu.aggregate([
					{ $match: { tenant_id: tenant_id } },
					{ $unwind: '$category' },
					{ $sort: { 'category.index': 1 } },
					{
						$project: {
							_id: 0,
							category: 1,
						},
					},
				]);

				return res.status(200).json({
					status: 'SUCCESS',
					message: 'Category has been deleted',
					data: RetrieveLatestMenu,
				});
			}
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Category has not been deleted',
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

// Create Menu
async function CreateMenu(req, res) {
	try {
		const { tenant_id } = req.params;
		const {
			cat_id,
			menu_name,
			menu_image,
			menu_duration,
			menu_desc,
			menu_isRecommended,
			menu_price,
			menu_quantity,
			menu_isAvailable,
			menu_isUnlimited,
			menu_isActive,
		} = req.body;

		// Menu ID
		let menu_id;
		let tempId = generateRandomNumber(5);

		const existingId = await Menu.findOne({
			'category.menu.id': 'M-' + tempId,
		});

		if (existingId) {
			tempId = new generateRandomNumber(5);
			return tempId;
		}
		menu_id = 'M-' + tempId;

		const checkCategory = await Menu.findOne({
			$and: [
				{ tenant_id: tenant_id },
				{ 'category.menu.name': { $ne: menu_name } },
			],
		});

		if (checkCategory) {
			const UpdateMenu = await Menu.updateOne(
				{
					$and: [
						{ tenant_id: tenant_id },
						{ 'category.id': { $eq: cat_id } },
					],
				},
				{
					$push: {
						'category.$.menu': {
							id: menu_id,
							name: menu_name,
							menuImage: menu_image,
							duration: menu_duration,
							description: menu_desc,
							isRecommended: menu_isRecommended,
							price: menu_price,
							quantity: menu_quantity,
							isvailable: menu_isAvailable,
							isUnlimited: menu_isUnlimited,
							isActive: menu_isActive,
						},
					},
				}
			);

			if (UpdateMenu) {
				const RetrieveLatestMenu = await Menu.aggregate([
					{ $match: { tenant_id: tenant_id } },
					{ $unwind: '$category' },
					{ $sort: { 'category.index': 1 } },
					{
						$project: {
							_id: 0,
							category: 1,
						},
					},
				]);

				if (RetrieveLatestMenu) {
					return res.status(200).json({
						status: 'SUCCESS',
						message: 'Menu has been created',
						data: RetrieveLatestMenu,
					});
				}
			} else {
				return res.status(404).json({
					status: 'FAILED',
					message: 'Menu has not been created',
				});
			}
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Menu name exists',
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

// Get All Menu
async function GetAllMenu(req, res) {
	try {
		const { tenant_id } = req.params;

		const checkMenu = await Menu.findOne({ tenant_id: tenant_id });

		if (checkMenu) {
			const combineMenu = await Menu.aggregate([
				{
					$match: {
						tenant_id: tenant_id,
					},
				},
				{
					$unwind: '$category',
				},
				{ $unwind: '$category.menu' },
				{
					$sort: {
						'category.menu.quantity': -1,
					},
				},
				{
					$group: {
						_id: '',
						menu: {
							$push: '$category.menu',
						},
					},
				},

				{
					$project: {
						_id: 0,
					},
				},
			]);

			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Category has been retrieved',
				data: combineMenu,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Category has not been retrieved',
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

// Get Specific Menu
async function GetMenu(req, res) {
	try {
		const { tenant_id, menu_id } = req.params;

		const checkMenu = await Menu.aggregate([
			{ $match: { tenant_id: tenant_id } },
			{ $unwind: '$category' },
			{ $unwind: '$category.menu' },
			{ $match: { 'category.menu.id': menu_id } },
			{
				$project: {
					_id: 0,
					tenant_id: 0,
					category: {
						_id: 0,
						id: 0,
						index: 0,
						name: 0,
					},
				},
			},
		]);

		if (checkMenu) {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Category has been retrieved',
				data: checkMenu,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Category has not been retrieved',
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

// Edit Menu
// async function EditMenu(req, res) {
//   try {
//     const { tenant_id } = req.params;
//     const {
//       cat_id,
//       menu_id,
//       menu_name,
//       menu_image,
//       menu_duration,
//       menu_desc,
//       menu_isRecommended,
//       menu_price,
//       menu_quantity,
//       menu_isAvailable,
//       menu_isUnlimited,
//       menu_isActive,
//     } = req.body;

//     // const checkMenu = await Menu.findOne({
//     //   $or: [
//     //     {
//     //       $and: [
//     //         { tenant_id: tenant_id },
//     //         { "category.id": { $eq: cat_id } },
//     //         { "category.menu.id": { $eq: menu_id } },
//     //         { "category.menu.name": { $eq: menu_name } },
//     //       ],
//     //     },
//     //     {
//     //       $and: [
//     //         { tenant_id: tenant_id },
//     //         { "category.id": cat_id },
//     //         { "category.menu.id": menu_id },
//     //         { "category.menu.name": { $ne: menu_name } },
//     //       ],
//     //     },
//     //     {
//     //       $and: [
//     //         { tenant_id: tenant_id },
//     //         { "category.id": cat_id },
//     //         { "category.menu.id": menu_id },
//     //         { "category.menu.name": { $eq: menu_name } },
//     //         { "category.menu.menuImage": { $ne: menu_image } },
//     //       ],
//     //     },
//     //     {
//     //       $and: [
//     //         { tenant_id: tenant_id },
//     //         { "category.id": cat_id },
//     //         { "category.menu.id": menu_id },
//     //         { "category.menu.name": { $eq: menu_name } },
//     //         { "category.menu.duration": { $ne: menu_duration } },
//     //       ],
//     //     },
//     //     {
//     //       $and: [
//     //         { tenant_id: tenant_id },
//     //         { "category.id": cat_id },
//     //         { "category.menu.id": menu_id },
//     //         { "category.menu.name": { $eq: menu_name } },
//     //         { "category.menu.price": { $ne: menu_price } },
//     //       ],
//     //     },
//     //     {
//     //       $and: [
//     //         { tenant_id: tenant_id },
//     //         { "category.id": cat_id },
//     //         { "category.menu.id": menu_id },
//     //         { "category.menu.name": { $eq: menu_name } },
//     //         { "category.menu.description": { $ne: menu_desc } },
//     //       ],
//     //     },
//     //     {
//     //       $and: [
//     //         { tenant_id: tenant_id },
//     //         { "category.id": cat_id },
//     //         { "category.menu.id": menu_id },
//     //         { "category.menu.name": { $eq: menu_name } },
//     //         { "category.menu.isRecommended": { $ne: menu_isRecommended } },
//     //       ],
//     //     },
//     //     {
//     //       $and: [
//     //         { tenant_id: tenant_id },
//     //         { "category.id": cat_id },
//     //         { "category.menu.id": menu_id },
//     //         { "category.menu.name": { $eq: menu_name } },
//     //         { "category.menu.isUnlimited": { $ne: menu_isUnlimited } },
//     //       ],
//     //     },
//     //     {
//     //       $and: [
//     //         { tenant_id: tenant_id },
//     //         { "category.id": cat_id },
//     //         { "category.menu.id": menu_id },
//     //         { "category.menu.name": { $eq: menu_name } },
//     //         { "category.menu.isActive": { $ne: menu_isActive } },
//     //       ],
//     //     },
//     //   ],
//     // });

//     const checkMenu = await Menu.findOne({
// 		  $and: [
//         { tenant_id: tenant_id },
//         { 'category.id': cat_id },
//         { 'category.menu.id': menu_id },
//       ]
//     });

//     if (checkMenu) {
//       const checkMenuID = await Menu.findOne({
//         $and: [
//           { "category.id": cat_id },
//           { "category.menu.name": { $ne: menu_name } },
//         ],
//       });

//       if (!checkMenuID) {
//         const checkMenuIDDelete = await Menu.findOne({
//           $and: [
//             { "category.id": cat_id },
//             { "category.menu.name": { $eq: menu_name } },
//           ],
//         });

//         if (checkMenuIDDelete) {
//           const deleteMenu = await Menu.updateOne(
//             {
//               "category.menu.id": menu_id,
//             },
//             {
//               $pull: {
//                 "category.$.menu": { id: menu_id },
//               },
//             }
//           );

//           if (deleteMenu) {
//             const UpdateMenu = await Menu.updateOne(
//               {
//                 $and: [
//                   { tenant_id: tenant_id },
//                   { "category.id": { $eq: cat_id } },
//                 ],
//               },
//               {
//                 $push: {
//                   "category.$.menu": {
//                     id            : menu_id,
//                     name          : menu_name,
//                     menuImage     : menu_image,
//                     duration      : menu_duration,
//                     description   : menu_desc,
//                     isRecommended : menu_isRecommended,
//                     price         : menu_price,
//                     quantity      : menu_quantity,
//                     isvailable    : menu_isAvailable,
//                     isUnlimited   : menu_isUnlimited,
//                     isActive      : menu_isActive
//                   },
//                 },
//               }
//             );

//             if (UpdateMenu) {
//               const RetrieveLatestMenu = await Menu.aggregate([
//                 { $match: { tenant_id: tenant_id } },
//                 { $unwind: "$category" },
//                 { $sort: { "category.index": 1 } },
//                 {
//                   $project: {
//                     _id: 0,
//                     category: 1,
//                   },
//                 },
//               ]);

//               if (RetrieveLatestMenu) {
//                 return res.status(200).json({
//                   status: "SUCCESS",
//                   message: "Menu has been created",
//                   data: RetrieveLatestMenu,
//                 });
//               }
//             } else {
//               return res.status(404).json({
//                 status: "FAILED",
//                 message: "Menu has not been updated",
//               });
//             }
//           }
//         }
//       } else {
//         const UpdateMenu = await Menu.updateOne(
//           {
//             $and: [{ "category.id": cat_id }, { "category.menu.id": menu_id }],
//           },
//           {
//             $set: {
//               "category.$[outer].menu.$[inner].name": menu_name,
//               "category.$[outer].menu.$[inner].menuImage": menu_image,
//               "category.$[outer].menu.$[inner].duration": menu_duration,
//               "category.$[outer].menu.$[inner].description": menu_desc,
//               "category.$[outer].menu.$[inner].isRecommended":
//                 menu_isRecommended,
//               "category.$[outer].menu.$[inner].price"       : menu_price,
//               "category.$[outer].menu.$[inner].quantity"    : menu_quantity,
//               "category.$[outer].menu.$[inner].isAvailable" : menu_isAvailable,
//               "category.$[outer].menu.$[inner].isUnlimited" : menu_isUnlimited,
//               "category.$[outer].menu.$[inner].isActive"    : menu_isActive,
//             },
//           },
//           {
//             arrayFilters: [{ "outer.id": cat_id }, { "inner.id": menu_id }],
//           }
//         );

//         if (UpdateMenu) {
//           const RetrieveLatestMenu = await Menu.aggregate([
//             { $match: { tenant_id: tenant_id } },
//             { $unwind: "$category" },
//             { $unwind: "$category.menu" },
//             { $match: {
//                 "category.menu.id": menu_id
//               }
//             }
//           ]);

//           if (RetrieveLatestMenu) {
//             return res.status(200).json({
//               status: "SUCCESS",
//               message: "Menu has been retrieved",
//               data: RetrieveLatestMenu,
//             });
//           } else {
//             return res.status(404).json({
//               status: "FAILED",
//               message: "Menu has not been retrieved",
//               data: RetrieveLatestMenu,
//             });
//           }
//         } else {
//           return res.status(404).json({
//             status: "FAILED",
//             message: "Menu has not been updated",
//           });
//         }
//       }
//     } else {
//       return res.status(404).json({
//         status: "FAILED",
//         message: "Menu does not exists",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       status: "FAILED",
//       message: error.message,
//     });
//   }
// }

async function EditMenu(req, res) {
	try {
		const { tenant_id } = req.params;
		const {
			cat_id,
			menu_id,
			menu_name,
			menu_image,
			menu_duration,
			menu_desc,
			menu_isRecommended,
			menu_price,
			menu_quantity,
			menu_isAvailable,
			menu_isUnlimited,
			menu_isActive,
		} = req.body;

		const checkCategory = await Menu.findOne({
			$and: [{ tenant_id: tenant_id }, { 'category.id': cat_id }],
		});

		if (checkCategory) {
			const checkMenu = await Menu.findOne({
				$and: [
					{ tenant_id: tenant_id },
					{ 'category.id': cat_id },
					{ 'category.menu.id': menu_id },
				],
			});

			if (checkMenu) {
				const UpdateMenu = await Menu.updateOne(
					{
						$and: [
							{ 'category.id': cat_id },
							{ 'category.menu.id': menu_id },
						],
					},
					{
						$set: {
							'category.$[outer].menu.$[inner].name': menu_name,
							'category.$[outer].menu.$[inner].menuImage':
								menu_image,
							'category.$[outer].menu.$[inner].duration':
								menu_duration,
							'category.$[outer].menu.$[inner].description':
								menu_desc,
							'category.$[outer].menu.$[inner].isRecommended':
								menu_isRecommended,
							'category.$[outer].menu.$[inner].price': menu_price,
							'category.$[outer].menu.$[inner].quantity':
								menu_quantity,
							'category.$[outer].menu.$[inner].isAvailable':
								menu_isAvailable,
							'category.$[outer].menu.$[inner].isUnlimited':
								menu_isUnlimited,
							'category.$[outer].menu.$[inner].isActive':
								menu_isActive,
						},
					},
					{
						arrayFilters: [
							{ 'outer.id': cat_id },
							{ 'inner.id': menu_id },
						],
					}
				);

				if (UpdateMenu) {
					const RetrieveLatestMenu = await Menu.aggregate([
						{ $match: { tenant_id: tenant_id } },
						{ $unwind: '$category' },
						{ $unwind: '$category.menu' },
						{
							$match: {
								'category.menu.id': menu_id,
							},
						},
					]);

					if (RetrieveLatestMenu) {
						return res.status(200).json({
							status: 'SUCCESS',
							message: 'Menu has been retrieved',
							data: RetrieveLatestMenu,
						});
					} else {
						return res.status(404).json({
							status: 'FAILED',
							message: 'An error occured during retrieving menu',
						});
					}
				} else {
					return res.status(404).json({
						status: 'FAILED',
						message: 'An error occured during updating menu',
					});
				}
			} else {
				return res.status(404).json({
					status: 'FAILED',
					message: 'Menu ID not found',
				});
			}
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Category ID not found',
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

// Delete Menu
async function DeleteMenu(req, res) {
	try {
		const { tenant_id, menu_id } = req.params;

		const checkMenu = await Menu.findOne({
			'category.$.menu.id': menu_id,
		});

		if (checkMenu) {
			const deleteMenu = await Menu.updateOne(
				{
					'category.menu.id': menu_id,
				},
				{
					$pull: {
						'category.$.menu': { id: menu_id },
					},
				}
			);

			if (deleteMenu) {
				const RetrieveLatestMenu = await Menu.aggregate([
					{ $match: { tenant_id: tenant_id } },
					{ $unwind: '$category' },
					{ $sort: { 'category.index': 1 } },
					{
						$project: {
							_id: 0,
							category: 1,
						},
					},
				]);

				return res.status(200).json({
					status: 'SUCCESS',
					message: 'Menu has been deleted',
					data: RetrieveLatestMenu,
				});
			}
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Menu has not been deleted',
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
	CreateCategories,
	GetCategory,
	EditCategory,
	EditCategoryIndex,
	DeleteCategory,
	CreateMenu,
	GetAllMenu,
	GetMenu,
	EditMenu,
	DeleteMenu,
};
