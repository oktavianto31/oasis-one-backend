import Order from '../../models/orderModel.js';
import Payment from '../../models/paymentModel.js';
import Menu from '../../models/menuModel.js';
import Table from '../../models/tableModel.js';
import Tenant from '../../models/tenantModel.js';
import User from '../../models/userModel.js';
import Performance from '../../models/orderPerformanceModel.js';
import { generateRandomNumber } from '../../middlewares/randomizer.js';
import axios from 'axios';

// Create a Bot
import { bot } from '../Notification/telegram.js';
import { InlineKeyboard } from 'grammy';

// NEW
// 1 pending
// 2 payment
// 3 order placed
// 4 served
// 5 complete
// 6 reject

// Retrieve Order by order ID
async function retrieveOrderbyID(req, res) {
	try {
		const { order_id } = req.params;

		const checkOrder = await Order.aggregate([
			{ $match: { order_id: order_id } },
			{ $sort: { createdAt: -1 } },
		]);

		if (checkOrder) {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Order has been retrieved',
				data: checkOrder,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Order has not been retrieved',
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

// Retrieve Order by UserID
async function retrieveOrderbyUserID(req, res) {
	try {
		const { user_id } = req.params;

		const checkOrder = await Order.aggregate([
			{ $match: { user_id: user_id } },
			{ $sort: { createdAt: -1 } },
		]);

		if (checkOrder) {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Order has been retrieved',
				data: checkOrder,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Order has not been retrieved',
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

// Create Order
async function CreateOrder(req, res) {
	try {
		const {
			user_id,
			user_name,
			user_email,
			user_phonenumber,
			order_instruction,
			order_channel,
			order_online_id,
			order_pin,
			user_guest,
			data,
		} = req.body;

		var isError = false;

		if (user_id == undefined || user_id == null || user_id == '') {
			isError = true;
			res.status(500).json({
				status: 'FAILED',
				message: 'user_id is required',
			});
		}

		let orderIDList = [];
		let tenantList = [];

		data.map(async (item, index) => {
			console.log(item.tenant_id);
			let menuList = [];
			const existingTenant = await Tenant.findOne({
				tenant_id: item.tenant_id,
			});

			const checkTableIndex = await Table.aggregate([
				{ $match: { tenant_id: item.tenant_id } },
				{ $unwind: '$table' },
				{ $match: { 'table.id': item.order_table } },
			]);

			if (!checkTableIndex[0]) {
				return res.status(404).json({
					status: 'FAILED',
					message: 'Table does not exists',
				});
			}

			if (existingTenant) {
				item.order_data.map(async (inneritem, innerindex) => {
					const checkMenu = await Menu.aggregate([
						{ $match: { tenant_id: item.tenant_id } },
						{ $unwind: '$category' },
						{ $unwind: '$category.menu' },
						{ $match: { 'category.menu.id': inneritem.menu_id } },
						{
							$project: {
								_id: 0,
								category: {
									id: 1,
									'menu.id': 1,
									'menu.quantity': 1,
									'menu.isUnlimited': 1,
								},
							},
						},
					]);

					if (checkMenu) {
						let menuQuantity;

						if (checkMenu[0] == null) {
							isError = true;
							res.status(500).json({
								status: 'FAILED',
								message: 'Menu does not exists',
							});
						}

						if (
							checkMenu[0].category.menu.isUnlimited == false &&
							checkMenu[0].category.menu.quantity == 0
						) {
							isError = true;
							res.status(500).json({
								status: 'FAILED',
								message: `Menu ${checkMenu[0].category.menu.id} has been sold out`,
							});
						}

						if (checkMenu[0].category.menu.isUnlimited) {
							menuQuantity = checkMenu[0].category.menu.quantity - 0;
						} else if (checkMenu[0].category.menu.quantity - inneritem.order_qty <= 0) {
							isError = true;
							res.status(400).json({
								status: 'FAILED',
								message: 'Order quantity larger than available quantity',
							});
						} else {
							menuQuantity =
								checkMenu[0].category.menu.quantity - parseInt(inneritem.order_qty);
						}

						//* Update Menu DB
						const updateMenu = await Menu.updateOne(
							{
								$and: [
									{ 'category.id': checkMenu[0].category.id },
									{ 'category.menu.id': inneritem.menu_id },
								],
							},
							{
								$set: {
									'category.$[outer].menu.$[inner].quantity': menuQuantity,
									'category.$[outer].menu.$[inner].orderQuantity': parseInt(
										inneritem.order_qty
									),
								},
							},
							{
								arrayFilters: [
									{ 'outer.id': checkMenu[0].category.id },
									{ 'inner.id': inneritem.menu_id },
								],
							}
						);

						if (updateMenu && isError == false) {
							const retrieveUpdatedMenu = await Menu.aggregate([
								{ $match: { tenant_id: item.tenant_id } },
								{ $unwind: '$category' },
								{ $unwind: '$category.menu' },
								{
									$match: {
										'category.menu.id': inneritem.menu_id,
									},
								},
								{
									$project: {
										_id: 0,
										category: {
											menu: 1,
										},
									},
								},
							]);

							let updatedObject = retrieveUpdatedMenu[0].category.menu;
							await menuList.push(updatedObject);

							if (innerindex == item.order_data.length - 1) {
								const generateID = () => generateRandomNumber(7);
								let tempID = generateID();

								const existingId = await Order.findOne({
									order_id: 'ORD-' + tempID,
								});
								if (existingId) {
									tempID = new generateID();
									return tempID;
								}

								let order_id = 'ORD-' + tempID;
								await orderIDList.push(order_id);
								await tenantList.push(item.tenant_id);

								const existingUser = await User.findOne({
									user_id,
								});

								if (existingUser) {
									const newOrder = new Order({
										order_id: order_id,
										tenant_id: item.tenant_id,
										order_status: 1,
										order_state: 'PENDING',
										order_channel: order_channel ? order_channel : 'On Site',
										order_online_id: order_online_id ? order_online_id : '',
										order_pin: order_pin ? order_pin : '',
										order_table: item.order_table,
										order_table_index: checkTableIndex[0].table.index,
										order_time: new Date(),
										order_menu: menuList,
										order_item: item.order_item,
										order_servicecharge: item.order_servicecharge,
										order_taxcharge: item.order_taxcharge,
										order_total: item.order_total,
										user_id: user_id,
										user_name: user_name,
										user_phonenumber: user_phonenumber,
										order_instruction: order_instruction,
										user_guest: user_guest,
									});
									await newOrder.save();

									await User.updateOne(
										{ user_id: user_id },
										{
											$set: {
												name: user_name,
												phoneNumber: user_phonenumber,
											},
											$push: {
												history: {
													order_id: order_id,
													lastOrder: new Date(),
													tenant_id: item.tenant_id,
													order_channel: order_channel,
													order_online_id: order_online_id,
													tenant_name: existingTenant.name,
													order_table: item.order_table,
													order_total: item.order_total,
													user_guest: user_guest,
												},
											},
										}
									);

									await Table.updateOne(
										{ 'table.id': item.order_table },
										{
											$set: {
												'table.$.status': 'FILLED',
												'table.$.timeStart': new Date(),
												'table.$.customerCount': user_guest,
												'table.$.order_id': order_id,
											},
										}
									);

									const checkPartnerId = await Tenant.findOne({
										tenant_id: item.tenant_id,
									});

									if (checkPartnerId.partner_id == 'NEC') {
										const url = 'https://dev-nec-oasis.com/transaction';

										const nec_request_data = {
											customer: {
												userId: user_id,
												name: user_name,
												email: user_email,
												phone: user_phonenumber,
											},
											tenantId: item.tenant_id,
											eventTime: new Date(),
											amount: item.order_item,
											orderId: order_id,
										};

										console.log('payload', nec_request_data);

										if (isError == false) {
											axios
												.post(url, nec_request_data)
												.then((response) => {
													console.log('NEC Response Data: \n', response.data);
												})
												.catch((err) => {
													console.log('NEC Error: \n', err);
												});
										}
									}

									const updatedTenant = await Tenant.findOne({
										tenant_id: item.tenant_id,
									});

									try {
										if (
											updatedTenant.telegram_userid != '-' &&
											updatedTenant.telegram_userid != null &&
											isError == false
										) {
											const confirm_button = new InlineKeyboard().url(
												'Konfirmasi Pesanan',
												'https://backend.oasis-one.com/api/order/botedit/' +
													item.tenant_id +
													'/' +
													order_id +
													'/' +
													'2/' +
													item.order_table
											);

											const orderDetails = [];
											for (var i = 0; i < menuList.length; i++) {
												orderDetails.push(
													`\n${menuList[i].name} x ${menuList[i].orderQuantity}`
												);
											}

											await bot.api.sendMessage(
												updatedTenant.telegram_userid,
												`Hi ${updatedTenant.name}, Order ID = ${order_id} \n` +
													`${orderDetails} \n\n` +
													`Total Pembayaran IDR ${item.order_total} ` +
													`(Tax = IDR ${item.order_taxcharge} ` +
													`dan/atau SC = IDR ${item.order_servicecharge})` +
													`\n\n` +
													`Tekan tombol dibawah untuk KONFIRMASI` +
													`\n\n` +
													`-- Oasis One --`,
												{
													parse_mode: 'HTML',
													reply_markup: confirm_button,
												}
											);
										}
									} catch (err) {
										console.log('telegram error : ', err);
									}
								} else {
									isError = true;
									res.status(500).json({
										status: 'FAILED',
										message: 'User does not exists',
									});
								}
							}

							if (index == data.length - 1 && isError == false) {
								if (orderIDList.length == data.length) {
									return res.status(200).json({
										status: 'SUCCESS',
										message: 'Order has been placed',
										data: {
											user_id: user_id,
											order_list: orderIDList,
											tenant_list: tenantList,
										},
									});
								}
							}
						}
					} else {
						isError = true;
						res.status(500).json({
							status: 'FAILED',
							message: 'Menu does not exists',
						});
					}
				});
			} else {
				isError = true;
				res.status(500).json({
					status: 'FAILED',
					message: 'Tenant does not exists',
				});
			}
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

// Retrieve Order ( Tenant )
async function TenantRetrieveOrder(req, res) {
	try {
		const { tenant_id } = req.params;

		const checkOrder = await Order.aggregate([
			{ $match: { tenant_id: tenant_id } },
			{ $sort: { createdAt: -1 } },
		]);

		if (checkOrder) {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Order has been retrieved',
				data: checkOrder,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Order has not been retrieved',
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

// Retrieve Specific Order by user ID
async function retrieveOrderbyUser(req, res) {
	try {
		const { tenant_id } = req.params;
		const { user_id } = req.body;

		const checkOrder = await Order.aggregate([
			{ $match: { tenant_id: tenant_id } },
			{ $match: { user_id: user_id } },
			{ $sort: { createdAt: -1 } },
		]);

		if (checkOrder) {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Order has been retrieved',
				data: checkOrder,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Order has not been retrieved',
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

// Retrieve Specific Order ( Tenant )
async function TableRetrieveOrder(req, res) {
	try {
		const { tenant_id } = req.params;
		const { order_table } = req.body;

		const checkOrder = await Order.aggregate([
			{ $match: { tenant_id: tenant_id } },
			{ $match: { order_table: order_table } },
			{ $sort: { createdAt: -1 } },
		]);

		if (checkOrder) {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'Order has been retrieved',
				data: checkOrder,
			});
		} else {
			return res.status(404).json({
				status: 'FAILED',
				message: 'Order has not been retrieved',
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

// Edit Order Status
async function TenantEditStatus(req, res) {
	try {
		const { tenant_id, order_id } = req.params;
		const { order_status, order_table } = req.body;

		const order_state =
			order_status == 1
				? 'PENDING'
				: order_status == 2
				? 'PAYMENT IN PROGRESS'
				: order_status == 3
				? 'ORDER PLACED'
				: order_status == 4
				? 'ORDER SERVED'
				: order_status == 5
				? 'ORDER COMPLETED'
				: order_status == 6
				? 'ORDER REJECTED'
				: '-';

		const checkOrder = await Order.findOne({
			order_id: order_id,
		});

		if (checkOrder) {
			const updateOrder = await Order.updateOne(
				{ order_id: order_id },
				{
					$set: {
						order_status: order_status,
						order_state: order_state,
					},
				}
			);

			if (updateOrder) {
				if (order_status == 1) {
					const newPayment = new Payment({
						order_id: order_id,
						payment_amount: checkOrder.order_total,
						payment_status: 'NULL',
					});
					await newPayment.save();
				}

				if (order_status == 2) {
					await Payment.updateOne(
						{ order_id: order_id },
						{ $set: { payment_status: 'PENDING' } }
					);
				}

				if (order_status == 3) {
					await Payment.updateOne(
						{ order_id: order_id },
						{ $set: { payment_status: 'COMPLETED' } }
					);
				}

				if (order_status == 5) {
					const checkTable = await Table.findOne({
						table: { $elemMatch: { id: order_table } },
					});

					if (checkTable) {
						await Table.updateOne(
							{ 'table.id': order_table },
							{
								$set: {
									'table.$.status': 'EMPTY',
									'table.$.isWaiterCalled': false,
									'table.$.timeStart': new Date('2022-01-01'),
									'table.$.customerCount': 0,
									'table.$.order_id': 'NULL',
								},
							}
						);
					}
				}

				const latestOrder = await Order.aggregate([
					{ $match: { tenant_id: tenant_id } },
					{ $sort: { createdAt: -1 } },
				]);

				const checkPartnerId = await Tenant.findOne({
					tenant_id: tenant_id,
				});

				if (checkPartnerId.partner_id == 'NEC') {
					const url = 'https://dev-nec-oasis.com/webhook/status';

					const nec_request_data = {
						orderId: order_id,
						status: order_status,
					};

					console.log('payload', nec_request_data);

					axios
						.post(url, nec_request_data)
						.then((response) => {
							console.log('NEC Response Data: \n', response.data);
						})
						.catch((err) => {
							console.log('NEC Error: \n', err);
						});
				}

				const updatedTenant = await Tenant.findOne({
					tenant_id: tenant_id,
				});

				if (updatedTenant.telegram_userid != '-' && updatedTenant.telegram_userid != null) {
					const updatedOrder = await Order.findOne({
						order_id: order_id,
					});

					const orderDate = new Date(updatedOrder.order_time).toDateString();
					const orderTime = new Date(updatedOrder.order_time).toTimeString().split(' ')[0];

					const orderChannel =
						updatedOrder.order_channel == 'On Site' || updatedOrder.order_channel == 'Postman'
							? `\n`
							: `\nOnline Order ID : ${updatedOrder.order_online_id}`;

					await bot.api.sendMessage(
						updatedTenant.telegram_userid,
						`Update order.` +
							`\nOrder ID : ${order_id}` +
							`\nOrder Date : ${orderDate}` +
							`\nOrder Time : ${orderTime}` +
							`\nOrder Status : ${updatedOrder.order_state}` +
							`\nOrder Channel : ${updatedOrder.order_channel}` +
							orderChannel
					);
				}

				return res.status(200).json({
					status: 'SUCCESS',
					message: 'Order has been updated',
					data: latestOrder,
				});
			} else {
				return res.status(404).json({
					status: 'FAILED',
					message: 'Order failed to be updated',
				});
			}
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function TenantEditStatusBot(req, res) {
	try {
		const { tenant_id, order_id, order_status, order_table } = req.params;
		console.log('BOT Edit');

		const order_state =
			order_status == 1
				? 'PENDING'
				: order_status == 2
				? 'PAYMENT IN PROGRESS'
				: order_status == 3
				? 'ORDER PLACED'
				: order_status == 4
				? 'ORDER SERVED'
				: order_status == 5
				? 'ORDER COMPLETED'
				: order_status == 6
				? 'ORDER REJECTED'
				: '-';

		const checkOrder = await Order.findOne({
			order_id: order_id,
		});

		if (checkOrder) {
			const updateOrder = await Order.updateOne(
				{ order_id: order_id },
				{
					$set: {
						order_status: order_status,
						order_state: order_state,
					},
				}
			);

			if (updateOrder) {
				if (order_status == 1) {
					const newPayment = new Payment({
						order_id: order_id,
						payment_amount: checkOrder.order_total,
						payment_status: 'NULL',
					});
					await newPayment.save();
				}

				if (order_status == 2) {
					await Payment.updateOne(
						{ order_id: order_id },
						{ $set: { payment_status: 'PENDING' } }
					);
				}

				if (order_status == 3) {
					await Payment.updateOne(
						{ order_id: order_id },
						{ $set: { payment_status: 'COMPLETED' } }
					);
				}

				if (order_status == 5) {
					const checkTable = await Table.findOne({
						table: { $elemMatch: { id: order_table } },
					});

					if (checkTable) {
						await Table.updateOne(
							{ 'table.id': order_table },
							{
								$set: {
									'table.$.status': 'EMPTY',
									'table.$.isWaiterCalled': false,
									'table.$.timeStart': new Date('2022-01-01'),
									'table.$.customerCount': 0,
									'table.$.order_id': 'NULL',
								},
							}
						);
					}
				}

				const checkPartnerId = await Tenant.findOne({
					tenant_id: tenant_id,
				});

				if (checkPartnerId.partner_id == 'NEC') {
					const url = 'https://dev-nec-oasis.com/webhook/status';

					const nec_request_data = {
						orderId: order_id,
						status: order_status,
					};

					console.log('payload', nec_request_data);

					axios
						.post(url, nec_request_data)
						.then((response) => {
							console.log('NEC Response Data: \n', response.data);
						})
						.catch((err) => {
							console.log('NEC Error: \n', err);
						});
				}

				const updatedTenant = await Tenant.findOne({
					tenant_id: tenant_id,
				});

				if (updatedTenant.telegram_userid != '-' && updatedTenant.telegram_userid != null) {
					const updatedOrder = await Order.findOne({
						order_id: order_id,
					});

					const orderDate = new Date(updatedOrder.order_time).toDateString();
					const orderTime = new Date(updatedOrder.order_time).toTimeString().split(' ')[0];

					const orderChannel =
						updatedOrder.order_channel == 'On Site' || updatedOrder.order_channel == 'Postman'
							? `\n`
							: `\nOnline Order ID : ${updatedOrder.order_online_id}`;

					await bot.api.sendMessage(
						updatedTenant.telegram_userid,
						`Update order.` +
							`\nOrder ID : ${order_id}` +
							`\nOrder Date : ${orderDate}` +
							`\nOrder Time : ${orderTime}` +
							`\nOrder Status : ${updatedOrder.order_state}` +
							`\nOrder Channel : ${updatedOrder.order_channel}` +
							orderChannel
					);
				}

				return res.status(200).redirect('https://t.me/OasisOneBot');
			} else {
				return res.status(404).json({
					status: 'FAILED',
					message: 'Order failed to be updated',
				});
			}
		} else {
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

// Reject Order
async function TenantRejectOrder(req, res) {
	try {
		const { tenant_id, order_id } = req.params;
		const { order_status, reject_reason } = req.body;

		const checkOrder = await Order.findOne({
			order_id: order_id,
		});

		if (order_id == '') {
			return res.status(200).json({
				status: 'FAILED',
				message: 'Order is empty',
			});
		} else {
			if (checkOrder) {
				if (order_status == 6) {
					const checkTable = await Table.findOne({
						table: { $elemMatch: { id: checkOrder.order_table } },
					});

					if (checkTable) {
						await Table.updateOne(
							{ 'table.id': checkOrder.order_table },
							{
								$set: {
									'table.$.status': 'EMPTY',
									'table.$.isWaiterCalled': false,
									'table.$.timeStart': new Date('2022-01-01'),
									'table.$.customerCount': 0,
									'table.$.order_id': 'NULL',
								},
							}
						);

						await checkOrder.order_menu.map(async (item, index) => {
							const findMenu = await Menu.aggregate([
								{ $match: { tenant_id: tenant_id } },
								{ $unwind: '$category' },
								{ $unwind: '$category.menu' },
								{ $match: { 'category.menu.id': item.id } },
							]);

							if (findMenu) {
								var updateMenu;
								if (reject_reason == 'Food stocks are depleted') {
									updateMenu = await Menu.updateOne(
										{
											tenant_id: tenant_id,
											'category.menu.id': item.id,
										},
										{
											$set: {
												'category.$.menu.$[inner].quantity': 0,
											},
										},
										{
											arrayFilters: [{ 'inner.id': item.id }],
										}
									);
								} else {
									updateMenu = await Menu.updateOne(
										{
											tenant_id: tenant_id,
											'category.menu.id': item.id,
										},
										{
											$set: {
												'category.$.menu.$[inner].quantity':
													findMenu[0].category.menu.quantity + item.orderQuantity,
											},
										},
										{
											arrayFilters: [{ 'inner.id': item.id }],
										}
									);
								}

								if (updateMenu && index == checkOrder.order_menu.length - 1) {
									const updateOrder = await Order.updateOne(
										{ order_id: order_id },
										{
											$set: {
												order_status: order_status,
												reject_reason: reject_reason,
											},
										}
									);

									if (updateOrder) {
										const RetrieveLatestOrder = await Order.aggregate([
											{ $match: { tenant_id: tenant_id } },
											{ $sort: { createdAt: -1 } },
										]);

										const checkPartnerId = await Tenant.findOne({
											tenant_id: tenant_id,
										});

										if (checkPartnerId.partner_id == 'NEC') {
											const url = 'https://dev-nec-oasis.com/webhook/status';

											const nec_request_data = {
												orderId: order_id,
												status: order_status,
											};

											console.log('payload', nec_request_data);

											axios
												.post(url, nec_request_data)
												.then((response) => {
													console.log('NEC Response Data: \n', response.data);
												})
												.catch((err) => {
													console.log('NEC Error: \n', err);
												});
										}

										const updatedTenant = await Tenant.findOne({
											tenant_id: tenant_id,
										});

										if (
											updatedTenant.telegram_userid != '-' &&
											updatedTenant.telegram_userid != null
										) {
											const latest = await Order.findOne({
												order_id: order_id,
											});

											const orderDate = new Date(latest.order_time).toDateString();
											const orderTime = new Date(latest.order_time)
												.toTimeString()
												.split(' ')[0];

											const orderChannel =
												latest.order_channel == 'On Site' ||
												latest.order_channel == 'Postman'
													? `\n`
													: `\nOnline Order ID : ${latest.order_online_id}`;

											await bot.api.sendMessage(
												updatedTenant.telegram_userid,
												`Update order - Rejected.` +
													`\nOrder ID : ${order_id}` +
													`\nOrder Date : ${orderDate}` +
													`\nOrder Time : ${orderTime}` +
													`\nOrder Status : ${latest.order_state}` +
													`\nReject Reason : ${reject_reason}` +
													`\nOrder Channel : ${latest.order_channel}` +
													orderChannel
											);
										}

										return res.status(200).json({
											status: 'SUCCESS',
											message: 'Order has been updated',
											data: RetrieveLatestOrder,
										});
									} else {
										return res.status(404).json({
											status: 'FAILED',
											message: 'Order failed to be updated',
										});
									}
								}
							}
						});
					} else {
						return res.status(404).json({
							status: 'FAILED',
							message: 'Table does not exists',
						});
					}
				}
			}
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

// async function orderSummary(req, res) {
// 	try {
// 		const { tenant_id, end_date, end_date } = req.body;
// 		var data = [];
// 		var checkTenantOrder = [];
// 		var order_total = {};
// 		var quantity = 0;
// 		var sales = 0;
// 		var count = 0;

// 		if (new Date(start_date) > new Date(end_date)) {
// 			return res.status(400).json({
// 				status: 'FAILED',
// 				message: 'Invalid Date',
// 			});
// 		}

// 		const timeoffset = 25200000;
// 		const dateoffset = 61200000;

// 		if (start_date && end_date) {
// 			if (start_date == end_date) {
// 				checkTenantOrder = await Order.find({
// 					tenant_id: tenant_id,
// 					createdAt: {
// 						$gte: new Date(Date.parse(start_date) - timeoffset),
// 						$lte: new Date(Date.parse(start_date) + dateoffset),
// 					},
// 				});
// 			} else {
// 				checkTenantOrder = await Order.find({
// 					tenant_id: tenant_id,
// 					createdAt: {
// 						$gte: new Date(Date.parse(start_date) - timeoffset),
// 						$lte: new Date(Date.parse(end_date) + dateoffset),
// 					},
// 				});
// 			}
// 		} else {
// 			checkTenantOrder = await Order.find({
// 				tenant_id: tenant_id,
// 			});
// 		}

// 		const timeout =
// 			checkTenantOrder.length <= 25
// 				? checkTenantOrder.length < 4
// 					? 1000
// 					: checkTenantOrder.length * 250
// 				: 5000;

// 		if (checkTenantOrder.length > 0) {
// 			checkTenantOrder.forEach(async (element, index) => {
// 				if (index == 0) {
// 					element.order_menu.forEach(async (e, i) => {
// 						const menuData = {
// 							menu_name: String,
// 							menu_category: String,
// 							menu_price: String,
// 							order_quantity: Number,
// 							order_count: Number,
// 							total_price: Number,
// 						};

// 						await Menu.aggregate([
// 							{ $match: { tenant_id: tenant_id } },
// 							{ $unwind: '$category' },
// 							{ $unwind: '$category.menu' },
// 							{
// 								$match: {
// 									'category.menu.id': e.id,
// 								},
// 							},
// 							{
// 								$project: {
// 									_id: 0,
// 									category: {
// 										name: 1,
// 										menu: 1,
// 									},
// 								},
// 							},
// 						]).then((category) => {
// 							menuData.menu_name = e.name;
// 							menuData.menu_category = category[0] ? category[0].category.name : '-';
// 							menuData.menu_price = e.price;
// 							menuData.order_quantity = e.orderQuantity;
// 							menuData.order_count = 1;
// 							menuData.total_price = e.orderQuantity * parseInt(e.price.replace(',', ''));

// 							data.push(menuData);
// 						});
// 					});
// 				} else {
// 					element.order_menu.forEach(async (e, i) => {
// 						const menuData = {
// 							menu_name: String,
// 							menu_category: String,
// 							menu_price: String,
// 							today_quantity: Number,
// 							order_quantity: Number,
// 							order_count: Number,
// 							total_price: String,
// 						};
// 						await Menu.aggregate([
// 							{ $match: { tenant_id: tenant_id } },
// 							{ $unwind: '$category' },
// 							{ $unwind: '$category.menu' },
// 							{
// 								$match: {
// 									'category.menu.id': e.id,
// 								},
// 							},
// 							{
// 								$project: {
// 									_id: 0,
// 									category: {
// 										name: 1,
// 										menu: 1,
// 									},
// 								},
// 							},
// 						]).then((category) => {
// 							const result = data.find((Object) => {
// 								return Object.menu_name == e.name;
// 							});

// 							const resultIndex = data.findIndex((Object) => {
// 								return Object.menu_name == e.name;
// 							});

// 							if (result) {
// 								menuData.menu_name = e.name;
// 								menuData.menu_category = data[resultIndex].menu_category;
// 								menuData.menu_price = e.price;
// 								menuData.order_quantity =
// 									data[resultIndex].order_quantity + e.orderQuantity;
// 								menuData.order_count = data[resultIndex].order_count + 1;
// 								menuData.total_price =
// 									(data[resultIndex].order_quantity + e.orderQuantity) *
// 									parseInt(e.price.replace(',', ''));

// 								data.splice(resultIndex, 1);
// 								data.push(menuData);
// 							} else {
// 								menuData.menu_name = e.name;
// 								menuData.menu_category = category[0].category.name
// 									? category[0].category.name
// 									: '-';
// 								menuData.order_quantity = e.orderQuantity;
// 								menuData.order_count = 1;
// 								menuData.menu_price = e.price;
// 								menuData.total_price = e.orderQuantity * parseInt(e.price.replace(',', ''));
// 								data.push(menuData);
// 							}
// 						});
// 					});
// 				}

// 				setTimeout(() => {
// 					if (index == checkTenantOrder.length - 1) {
// 						data.forEach((element, index) => {
// 							quantity = quantity + element.order_quantity;
// 							sales = sales + parseInt(element.total_price);
// 							count = index + 1;
// 						});

// 						order_total = {
// 							order_count: count,
// 							order_quantity: quantity,
// 							total_sales: sales.toString(),
// 							menu_summary: data,
// 						};

// 						return res.status(200).json({
// 							status: 'SUCCESS',
// 							data: order_total,
// 						});
// 					}
// 				}, timeout);
// 			});
// 		}
// 	} catch (error) {
// 		console.log(error);
// 		return res.status(500).json({
// 			status: 'FAILED',
// 			message: error.message,
// 		});
// 	}
// }

// async function todaySummary(req, res) {
// 	try {
// 		const { tenant_id, today_date } = req.body;
// 		var data = [];
// 		var todayOrder = [];
// 		var order_total = {};
// 		var quantity = 0;
// 		var sales = 0;
// 		var count = 0;

// 		const timeoffset = 25200000;
// 		const dateoffset = 61200000;

// 		todayOrder = await Order.find({
// 			tenant_id: tenant_id,
// 			createdAt: {
// 				$gte: new Date(Date.parse(today_date) - timeoffset),
// 				$lte: new Date(Date.parse(today_date) + dateoffset),
// 			},
// 		});

// 		const timeout =
// 			todayOrder.length <= 25 ? (todayOrder.length < 4 ? 1000 : todayOrder.length * 250) : 5000;

// 		if (todayOrder.length > 0) {
// 			todayOrder.forEach(async (element, index) => {
// 				if (index == 0) {
// 					element.order_menu.forEach(async (e, i) => {
// 						const menuData = {
// 							menu_name: String,
// 							menu_category: String,
// 							menu_price: String,
// 							order_quantity: Number,
// 							order_count: Number,
// 							total_price: Number,
// 						};

// 						await Menu.aggregate([
// 							{ $match: { tenant_id: tenant_id } },
// 							{ $unwind: '$category' },
// 							{ $unwind: '$category.menu' },
// 							{
// 								$match: {
// 									'category.menu.id': e.id,
// 								},
// 							},
// 							{
// 								$project: {
// 									_id: 0,
// 									category: {
// 										name: 1,
// 										menu: 1,
// 									},
// 								},
// 							},
// 						]).then((category) => {
// 							console.log(category);
// 							menuData.menu_name = e.name;
// 							menuData.menu_category = category[0].category.name
// 								? category[0].category.name
// 								: '-';
// 							menuData.menu_price = e.price;
// 							menuData.order_quantity = e.orderQuantity;
// 							menuData.order_count = 1;
// 							menuData.total_price = e.orderQuantity * parseInt(e.price.replace(',', ''));

// 							data.push(menuData);
// 						});
// 					});
// 				} else {
// 					element.order_menu.forEach(async (e, i) => {
// 						const menuData = {
// 							menu_name: String,
// 							menu_category: String,
// 							menu_price: String,
// 							today_quantity: Number,
// 							order_quantity: Number,
// 							order_count: Number,
// 							total_price: String,
// 						};
// 						await Menu.aggregate([
// 							{ $match: { tenant_id: tenant_id } },
// 							{ $unwind: '$category' },
// 							{ $unwind: '$category.menu' },
// 							{
// 								$match: {
// 									'category.menu.id': e.id,
// 								},
// 							},
// 							{
// 								$project: {
// 									_id: 0,
// 									category: {
// 										name: 1,
// 										menu: 1,
// 									},
// 								},
// 							},
// 						]).then((element) => {
// 							const result = data.find((Object) => {
// 								return Object.menu_name == e.name;
// 							});

// 							const resultIndex = data.findIndex((Object) => {
// 								return Object.menu_name == e.name;
// 							});

// 							if (result) {
// 								menuData.menu_name = e.name;
// 								menuData.menu_category = data[resultIndex].menu_category;
// 								menuData.menu_price = e.price;
// 								menuData.order_quantity =
// 									data[resultIndex].order_quantity + e.orderQuantity;
// 								menuData.order_count = data[resultIndex].order_count + 1;
// 								menuData.total_price =
// 									(data[resultIndex].order_quantity + e.orderQuantity) *
// 									parseInt(e.price.replace(',', ''));

// 								data.splice(resultIndex, 1);
// 								data.push(menuData);
// 							} else {
// 								menuData.menu_name = e.name;
// 								menuData.menu_category = element[0].category.name
// 									? element[0].category.name
// 									: '-';
// 								menuData.order_quantity = e.orderQuantity;
// 								menuData.order_count = 1;
// 								menuData.menu_price = e.price;
// 								menuData.total_price = e.orderQuantity * parseInt(e.price.replace(',', ''));

// 								data.push(menuData);
// 							}
// 						});
// 					});
// 				}

// 				setTimeout(() => {
// 					if (index == todayOrder.length - 1) {
// 						data.forEach((element, index) => {
// 							quantity = quantity + element.order_quantity;
// 							sales = sales + parseInt(element.total_price);
// 							count = index + 1;
// 						});

// 						order_total = {
// 							order_count: count,
// 							order_quantity: quantity,
// 							total_sales: sales.toString(),
// 							menu_summary: data,
// 						};

// 						return res.status(200).json({
// 							status: 'SUCCESS',
// 							data: order_total,
// 						});
// 					}
// 				}, timeout);
// 			});
// 		}
// 	} catch (error) {
// 		console.log(error);
// 		return res.status(500).json({
// 			status: 'FAILED',
// 			message: error.message,
// 		});
// 	}
// }

// async function getPerformance(req, res) {
// 	try {
// 		const { tenant_id, start_date, end_date } = req.body;

// 		const timeoffset = 25200000;
// 		const dateoffset = 61200000;
// 		const monthoffset = 2592000000;

// 		const startDate = new Date(Date.parse(start_date) - timeoffset);
// 		const endDate = new Date(Date.parse(end_date) + dateoffset);

// 		for (var i = startDate; i <= endDate; i.setDate(i.getDate() + 1)) {
// 			var data = [];
// 			var performance = {};
// 			var net_income = 0;
// 			var net_sold = 0;
// 			var net_count = 0;

// 			const selectedOrder = await Order.find({
// 				tenant_id: tenant_id,
// 				createdAt: {
// 					$gte: new Date(Date.parse(i) - timeoffset),
// 					$lte: new Date(Date.parse(i) + dateoffset),
// 				},
// 			});

// 			if (selectedOrder.length > 0) {
// 				selectedOrder.forEach(async (element, index) => {
// 					element.order_menu.forEach(async (e, i) => {
// 						const menuData = {
// 							net_income: String,
// 							net_sold: Number,
// 							net_count: Number,
// 						};

// 						const result = data.find((Object) => {
// 							return Object.date == i;
// 						});

// 						const resultIndex = data.findIndex((Object) => {
// 							return Object.date == i;
// 						});

// 						if (result) {
// 							menuData.net_count = data[resultIndex].order_count + 1;
// 							menuData.net_sold = data[resultIndex].order_quantity + e.orderQuantity;
// 							menuData.net_income = (
// 								(data[resultIndex].order_quantity + e.orderQuantity) *
// 								parseInt(e.price.replace(',', ''))
// 							).toString();

// 							data.splice(resultIndex, 1);
// 							data.push(menuData);
// 						} else {
// 							menuData.net_count = 1;
// 							menuData.net_sold = e.orderQuantity;
// 							menuData.net_income = (
// 								e.orderQuantity * parseInt(e.price.replace(',', ''))
// 							).toString();

// 							data.push(menuData);
// 						}
// 					});

// 					data.forEach((element, index) => {
// 						net_sold = net_sold + element.net_sold;
// 						net_income = net_income + parseInt(element.net_income);
// 						net_count = index + 1;
// 					});

// 					performance = {
// 						net_count: net_count,
// 						net_sold: net_sold,
// 						net_income: net_income.toString(),
// 					};
// 				});

// 				const checkPerformance = await Performance.findOne({
// 					tenant_id: tenant_id,
// 				});

// 				if (checkPerformance) {
// 					const checkDate = await Performance.findOne({
// 						tenant_id: tenant_id,
// 						'performance.date': new Date(i),
// 					});

// 					await Performance.aggregate([
// 						{ $match: { tenant_id: tenant_id } },
// 						{ $unwind: '$performance' },
// 						{ $sort: { 'performance.date': 1 } },
// 						{
// 							$match: {
// 								'performance.date': {
// 									$gte: new Date(Date.parse(i) + dateoffset - monthoffset),
// 									$lte: new Date(Date.parse(i) + dateoffset),
// 								},
// 							},
// 						},
// 						{
// 							$group: {
// 								_id: null,
// 								avg_income: { $avg: '$performance.net_income' },
// 								avg_sold: { $avg: '$performance.net_sold' },
// 								avg_count: { $avg: '$performance.net_count' },
// 								sum_income: { $sum: '$performance.net_income' },
// 								sum_sold: { $sum: '$performance.net_sold' },
// 								sum_count: { $sum: '$performance.net_count' },
// 							},
// 						},
// 					]).then(async (element) => {
// 						if (checkDate) {
// 							await Performance.updateOne(
// 								{
// 									tenant_id: tenant_id,
// 								},
// 								{
// 									$set: {
// 										'performance.$[inner].net_income': performance.net_income,
// 										'performance.$[inner].net_sold': performance.net_sold,
// 										'performance.$[inner].net_count': performance.net_count,
// 										'performance.$[inner].avg_income': element[0].avg_income,
// 										'performance.$[inner].avg_sold': element[0].avg_sold,
// 										'performance.$[inner].avg_count': element[0].avg_count,
// 										'performance.$[inner].total_income': element[0].sum_income,
// 										'performance.$[inner].total_sold': element[0].sum_sold,
// 										'performance.$[inner].total_count': element[0].sum_count,
// 										'performance.$[inner].pct_income':
// 											((performance.net_income - element[0].avg_income) * 100) /
// 											element[0].avg_income,
// 										'performance.$[inner].pct_sold':
// 											((performance.net_sold - element[0].avg_sold) * 100) /
// 											element[0].avg_sold,
// 										'performance.$[inner].pct_count':
// 											((performance.net_count - element[0].avg_count) * 100) /
// 											element[0].avg_count,
// 									},
// 								},
// 								{
// 									arrayFilters: [{ 'inner.date': i }],
// 								}
// 							);
// 						} else {
// 							await Performance.updateOne(
// 								{
// 									tenant_id: tenant_id,
// 								},
// 								{
// 									$push: {
// 										performance: {
// 											date: i,
// 											net_income: performance.net_income,
// 											net_sold: performance.net_sold,
// 											net_count: performance.net_count,
// 										},
// 									},
// 								}
// 							);

// 							await Performance.updateOne(
// 								{
// 									tenant_id: tenant_id,
// 								},
// 								{
// 									$set: {
// 										'performance.$[inner].net_income': performance.net_income,
// 										'performance.$[inner].net_sold': performance.net_sold,
// 										'performance.$[inner].net_count': performance.net_count,
// 										'performance.$[inner].avg_income': element[0].avg_income
// 											? element[0].avg_income
// 											: 0,
// 										'performance.$[inner].avg_sold': element[0].avg_sold
// 											? element[0].avg_sold
// 											: 0,
// 										'performance.$[inner].avg_count': element[0].avg_count
// 											? element[0].avg_count
// 											: 0,
// 										'performance.$[inner].total_income': element[0].sum_income
// 											? element[0].sum_income
// 											: 0,
// 										'performance.$[inner].total_sold': element[0].sum_sold
// 											? element[0].sum_sold
// 											: 0,
// 										'performance.$[inner].total_count': element[0].sum_count
// 											? element[0].sum_count
// 											: 0,
// 										'performance.$[inner].pct_income': element[0].avg_income
// 											? ((performance.net_income - element[0].avg_income) * 100) /
// 											  element[0].avg_income
// 											: 0,
// 										'performance.$[inner].pct_sold': element[0].avg_sold
// 											? ((performance.net_sold - element[0].avg_sold) * 100) /
// 											  element[0].avg_sold
// 											: 0,
// 										'performance.$[inner].pct_count': element[0].avg_count
// 											? ((performance.net_count - element[0].avg_count) * 100) /
// 											  element[0].avg_count
// 											: 0,
// 									},
// 								},
// 								{
// 									arrayFilters: [{ 'inner.date': i }],
// 								}
// 							);
// 						}
// 					});
// 				} else {
// 					const newPerformance = new Performance({
// 						tenant_id: tenant_id,
// 					});
// 					await newPerformance.save();

// 					if (newPerformance) {
// 						await Performance.updateOne(
// 							{
// 								tenant_id: tenant_id,
// 							},
// 							{
// 								$push: {
// 									performance: {
// 										date: i,
// 										net_income: performance.net_income,
// 										net_sold: performance.net_sold,
// 										net_count: performance.net_count,
// 										avg_income: performance.net_income,
// 										avg_sold: performance.net_sold,
// 										avg_count: performance.net_count,
// 										total_income: performance.net_income,
// 										total_sold: performance.net_sold,
// 										total_count: performance.net_count,
// 										pct_income: 0,
// 										pct_sold: 0,
// 										pct_count: 0,
// 									},
// 								},
// 							}
// 						);
// 					}
// 				}
// 			}
// 		}

// 		const checkPerformance = await Performance.findOne({
// 			tenant_id: tenant_id,
// 		}).sort({ 'performance.date': 1 });

// 		return res.status(200).json({
// 			status: 'SUCCESS',
// 			message: 'Data Populated',
// 			data: checkPerformance,
// 		});
// 	} catch (error) {
// 		console.log(error);
// 		return res.status(500).json({
// 			status: 'FAILED',
// 			message: error.message,
// 		});
// 	}
// }

// async function getOrderPerformance(req, res) {
// 	try {
// 		const { tenant_id, start_date, end_date } = req.body;
// 		var checkOrder;
// 		const timeoffset = 7 * 60 * 60 * 1000;
// 		const dateoffset = 24 * 60 * 60 * 1000;

// 		const daily_data = [];
// 		const menu_data = [];

// 		const order_item = {
// 			date: String,
// 			daily_count: Number,
// 			daily_quantity: Number,
// 			daily_sales: Number,
// 			total_tax: Number,
// 			total_service: Number,
// 			total_charges: Number,
// 			total_income: Number,
// 			daily_summary: Array,
// 		};

// 		const menu_item = {
// 			date: String,
// 			menu_id: String,
// 			menu_name: String,
// 			menu_category: String,
// 			menu_price: Number,
// 			order_quantity: Number,
// 			order_count: Number,
// 			total_price: Number,
// 		};

// 		// var daily_quantity = 0;
// 		// var daily_sales = 0;
// 		// var daily_count = 0;
// 		// var daily_data = [];
// 		// var order_summary = {};

// 		if (new Date(start_date) > new Date(end_date)) {
// 			return res.status(400).json({
// 				status: 'FAILED',
// 				message: 'Invalid Date',
// 			});
// 		}

// 		if (start_date && end_date && start_date != '' && end_date != '') {
// 			checkOrder = await Order.find({
// 				tenant_id: tenant_id,
// 				createdAt: {
// 					$gte: new Date(Date.parse(start_date) - timeoffset),
// 					$lte: new Date(Date.parse(end_date) + dateoffset - timeoffset),
// 				},
// 			});
// 		} else {
// 			checkOrder = await Order.find({
// 				tenant_id: tenant_id,
// 			});
// 		}

// 		if (checkOrder.length > 0) {
// 			const timeout = checkOrder.length <= 25 ? checkOrder.length * 250 : 5000;

// checkOrder.forEach(async (order, index) => {
// 	var data = [];
// 	var daily_result;
// 	var daily_resultIndex;
// 	const daily_item = {
// 		date: Date,
// 		daily_count: Number,
// 		daily_quantity: Number,
// 		daily_sales: String,
// 		menu_summary: Object,
// 	};

// 	order.order_menu.forEach(async (menu, index) => {
// 		var category;
// 		var result;
// 		var resultIndex;

// 		const menu_item = {
// 			menu_name: String,
// 			menu_category: String,
// 			menu_price: String,
// 			order_quantity: Number,
// 			order_count: Number,
// 			total_price: Number,
// 		};

// 		const menu_category = await Menu.aggregate([
// 			{ $match: { tenant_id: tenant_id } },
// 			{ $unwind: '$category' },
// 			{ $unwind: '$category.menu' },
// 			{
// 				$match: {
// 					'category.menu.id': menu.id,
// 				},
// 			},
// 			{
// 				$project: {
// 					_id: 0,
// 					category: {
// 						name: 1,
// 						menu: 1,
// 					},
// 				},
// 			},
// 		]);

// 		if (menu_category[0]) {
// 			category = menu_category[0].category.name;
// 		} else {
// 			category = '-';
// 		}

// 		if (data.length > 0) {
// 			result = await data.find((Object) => {
// 				return Object.menu_name == menu.name;
// 			});

// 			resultIndex = await data.findIndex((Object) => {
// 				return Object.menu_name == menu.name;
// 			});
// 		}

// 		menu_item.menu_name = menu.name;
// 		menu_item.menu_category = category;
// 		menu_item.menu_price = menu.price;
// 		menu_item.order_quantity = result
// 			? data[resultIndex].order_quantity + menu.orderQuantity
// 			: menu.orderQuantity;
// 		menu_item.order_count = result ? data[resultIndex].order_count + 1 : 1;
// 		menu_item.total_price = menu.orderQuantity * parseInt(menu.price.replace(',', ''));

// 		if (result) {
// 			data.splice(resultIndex, 1);
// 		}

// 		data.push(menu_item);
// 	});

// 	data.forEach((element, index) => {
// 		daily_quantity = daily_quantity + element.order_quantity;
// 		daily_sales = daily_sales + parseInt(element.total_price);
// 		daily_count = daily_count + element.order_count;
// 	});

// 	const selectedDate = new Date(order.order_time).toISOString().split('T')[0];

// 	if (daily_data.length > 0) {
// 		daily_result = await daily_data.find((Object) => {
// 			return Object.date == selectedDate;
// 		});

// 		daily_resultIndex = await daily_data.findIndex((Object) => {
// 			return Object.date == selectedDate;
// 		});
// 	}

// 	daily_item.date = new Date(Date.parse(selectedDate) - timeoffset);
// 	daily_item.daily_count = daily_count;
// 	daily_item.daily_quantity = daily_quantity;
// 	daily_item.daily_sales = daily_sales.toString();
// 	daily_item.menu_summary = data;

// 	if (daily_result) {
// 		data.splice(daily_resultIndex, 1);
// 	}

// 	daily_data.push(daily_item);

// 	setTimeout(() => {
// 		if (index == checkOrder.length - 1) {
// 			return res.status(200).json({
// 				status: 'SUCCESS',
// 				data: daily_data,
// 			});
// 		}
// 	}, timeout);
// });

// 			checkOrder.map(async (order, index) => {
// 				console.log(order.order_id);

// 				setTimeout(() => {
// 					if (index == checkOrder.length - 1) {
// 						return res.status(200).json({
// 							status: 'SUCCESS',
// 							data: menu_data,
// 						});
// 					}
// 				}, timeout);
// 			});
// 		}
// 	} catch (error) {
// 		console.log(error);
// 		return res.status(500).json({
// 			status: 'FAILED',
// 			message: error.message,
// 		});
// 	}
// }

{
	// var order_result;
	// var order_index;
	// var daily_count = 0;
	// var daily_quantity = 0;
	// var daily_sales = 0;
	// const selectedDate = new Date(order.order_time).toISOString().split('T')[0];
	// order.order_menu.forEach(async (menu, i) => {
	// 	// var category = '-';
	// 	// var menu_result;
	// 	// var menu_index;
	// 	// const menu_category = await Menu.aggregate([
	// 	// 	{ $match: { tenant_id: tenant_id } },
	// 	// 	{ $unwind: '$category' },
	// 	// 	{ $unwind: '$category.menu' },
	// 	// 	{
	// 	// 		$match: {
	// 	// 			'category.menu.id': menu.id,
	// 	// 		},
	// 	// 	},
	// 	// 	{
	// 	// 		$project: {
	// 	// 			_id: 0,
	// 	// 			category: {
	// 	// 				name: 1,
	// 	// 				menu: 1,
	// 	// 			},
	// 	// 		},
	// 	// 	},
	// 	// ]);
	// 	// if (menu_category[0]) category = menu_category[0].category.name;
	// 	// console.log(order.order_id);
	// 	// menu_result = menu_data.find((Obj) => Obj.menu_id === menu.id);
	// 	// menu_index = menu_data.findIndex((Obj) => Obj.menu_id === menu.id);
	// 	// console.log(menu_result);
	// 	// if (menu_data.length > 0) {
	// 	// 	menu_result = menu_data.find((Object) => {
	// 	// 		return Object.menu_name == menu.name;
	// 	// 	});
	// 	// 	menu_index = menu_data.findIndex((Object) => {
	// 	// 		return Object.menu_name == menu.name;
	// 	// 	});
	// 	// }
	// 	// menu_item.menu_name = menu.name;
	// 	// menu_item.menu_category = category;
	// 	// menu_item.menu_price = parseInt(menu.price.replace(',', ''));
	// 	// menu_item.order_quantity = menu_result
	// 	// 	? menu_data[menu_index].order_quantity + menu.orderQuantity
	// 	// 	: menu.orderQuantity;
	// 	// menu_item.order_count = menu_result ? menu_data[menu_index].order_count + 1 : 1;
	// 	// menu_item.total_price = menu.orderQuantity * parseInt(menu.price.replace(',', ''));
	// 	// if (menu_result) {
	// 	// 	menu_data.splice(menu_index, 1);
	// 	// }
	// 	// menu_data.push(menu_item);
	// });
	// setTimeout(async () => {
	// 	if (daily_data.length > 0) {
	// 		order_result = await daily_data.find((Object) => {
	// 			return Object.date == selectedDate;
	// 		});
	// 		order_index = daily_data.findIndex((Object) => {
	// 			return Object.date == selectedDate;
	// 		});
	// 	}
	// 	menu_data.forEach(async (element, index) => {
	// 		daily_quantity = daily_quantity + element.order_quantity;
	// 		daily_count = daily_count + element.order_count;
	// 		daily_sales = daily_sales + parseInt(element.total_price);
	// 	});
	// 	order_item.date = selectedDate;
	// 	order_item.daily_count = order_result
	// 		? daily_data[order_index].daily_count + daily_count
	// 		: daily_count;
	// 	order_item.daily_quantity = order_result
	// 		? daily_data[order_index].daily_quantity + daily_quantity
	// 		: daily_quantity;
	// 	order_item.daily_sales = order_result
	// 		? daily_data[order_index].daily_sales + daily_sales
	// 		: daily_sales;
	// 	order_item.total_tax = order_result
	// 		? daily_data[order_index].total_tax + order.order_taxcharge
	// 		: order.order_taxcharge;
	// 	order_item.total_service = order_result
	// 		? daily_data[order_index].total_service + order.order_servicecharge
	// 		: order.order_servicecharge;
	// 	order_item.total_charges = order_result
	// 		? daily_data[order_index].total_charges +
	// 		  (order.order_taxcharge + order.order_servicecharge)
	// 		: order.order_taxcharge + order.order_servicecharge;
	// 	order_item.total_income = order_result
	// 		? daily_data[order_index].total_income +
	// 		  (daily_sales + daily_data[order_index].total_charges)
	// 		: daily_sales + order.order_taxcharge + order.order_servicecharge;
	// 	order_item.daily_summary = menu_data;
	// 	if (order_result) {
	// 		daily_data.splice(order_index, 1);
	// 	}
	// 	daily_data.push(order_item);
	// 	if (index == checkOrder.length - 1) {
	// 		return res.status(200).json({
	// 			status: 'SUCCESS',
	// 			data: daily_data,
	// 		});
	// 	}
	// }, timeout);
}

async function getOrderPerformance(req, res) {
	try {
		const { tenant_id, start_date, end_date } = req.body;
		const timeoffset = 7 * 60 * 60 * 1000;
		const dateoffset = 24 * 60 * 60 * 1000;
		const today = new Date().toISOString().split('T')[0];
		const order_data = [];
		const shared_menu = [];
		var checkOrder;

		if (new Date(start_date) > new Date(end_date)) {
			return res.status(400).json({
				status: 'FAILED',
				message: 'Invalid Date',
			});
		}

		if (start_date && end_date && start_date != '' && end_date != '') {
			checkOrder = await Order.find({
				tenant_id: tenant_id,
				order_status: { $nin: [1, 6] },
				createdAt: {
					$gte: new Date(Date.parse(start_date) - timeoffset),
					$lte: new Date(Date.parse(end_date) + dateoffset - timeoffset),
				},
			});
		} else {
			if (end_date && end_date != '') {
				checkOrder = await Order.find({
					tenant_id: tenant_id,
					order_status: { $nin: [1, 6] },
					createdAt: {
						$gte: new Date(Date.parse(end_date) - 7 * dateoffset - timeoffset),
						$lte: new Date(Date.parse(end_date) + dateoffset - timeoffset),
					},
				});
			} else {
				checkOrder = await Order.find({
					tenant_id: tenant_id,
					order_status: { $nin: [1, 6] },
					createdAt: {
						$gte: new Date(Date.parse(today) - 7 * dateoffset - timeoffset),
						$lte: new Date(Date.parse(today) + dateoffset - timeoffset),
					},
				});
			}
		}

		if (checkOrder.length > 0) {
			const timeout = checkOrder.length * 275;
			const orderIdList = [];

			checkOrder.map((order, index) => {
				const selectedDate = new Date(order.order_time).toISOString().split('T')[0];
				const menu_data = [];
				var order_index;

				var orderid_index = orderIdList.findIndex((Obj) => {
					Obj === order.order_id;
				});

				if (orderid_index == -1) {
					orderIdList.push(order.order_id);
				}

				const order_item = {
					date: String,
					daily_count: Number,
					daily_quantity: Number,
					daily_sales: Number,
					total_tax: Number,
					total_service: Number,
					total_charges: Number,
					total_income: Number,
					daily_summary: Array,
				};

				order.order_menu.forEach((menu) => {
					const menu_item = {
						date: String,
						menu_id: String,
						menu_name: String,
						menu_price: String,
						order_quantity: Number,
						order_count: Number,
						total_price: Number,
					};

					menu_item.date = selectedDate;
					menu_item.menu_id = menu.id;
					menu_item.menu_name = menu.name;
					menu_item.menu_price = menu.price;
					menu_item.order_quantity = menu.orderQuantity;
					menu_item.order_count = 1;
					menu_item.total_price = menu.orderQuantity * parseInt(menu.price.replace(',', ''));

					menu_data.push(menu_item);
				});

				order_index = order_data.findIndex((Obj) => Obj.date === selectedDate);

				menu_data.map((element) => {
					var inner_index = shared_menu.findIndex(
						(Obj) => Obj.menu_id === element.menu_id && Obj.date === selectedDate
					);

					if (inner_index === -1) {
						// console.log('if', inner_index);
						shared_menu.push(element);
					} else {
						const shared_item = {
							date: String,
							menu_id: String,
							menu_name: String,
							menu_price: String,
							order_quantity: Number,
							order_count: Number,
							total_price: Number,
						};
						// console.log('else', inner_index);

						shared_item.date = shared_menu[inner_index].date;
						shared_item.menu_id = shared_menu[inner_index].menu_id;
						shared_item.menu_name = shared_menu[inner_index].menu_name;
						shared_item.menu_price = shared_menu[inner_index].menu_price;
						shared_item.order_quantity =
							shared_menu[inner_index].order_quantity + element.order_quantity;
						shared_item.order_count = shared_menu[inner_index].order_count + 1;
						shared_item.total_price =
							(shared_menu[inner_index].order_quantity + element.order_quantity) *
							parseInt(shared_menu[inner_index].menu_price.replace(',', ''));

						shared_menu.splice(inner_index, 1, shared_item);
					}
				});

				order_item.date = selectedDate;
				order_item.daily_summary = menu_data;
				order_item.total_tax = order.order_taxcharge;
				order_item.total_service = order.order_servicecharge;
				order_item.total_charges = order.order_taxcharge + order.order_servicecharge;

				if (order_index !== -1) {
					var shared_items = [];

					shared_menu
						.filter((e) => e.date === selectedDate)
						.map((i) => {
							shared_items.push(i);
						});

					order_item.date = selectedDate;
					order_item.daily_summary = shared_items;
					order_item.total_tax = order_data[order_index].total_tax + order.order_taxcharge;
					order_item.total_service =
						order_data[order_index].total_service + order.order_servicecharge;
					order_item.total_charges =
						order_data[order_index].total_charges +
						order.order_taxcharge +
						order.order_servicecharge;
					order_item.total_income =
						order_data[order_index].total_income +
						order.order_taxcharge +
						order.order_servicecharge;

					order_data.splice(order_index, 1);
				}

				order_data.push(order_item);

				setTimeout(() => {
					if (index == checkOrder.length - 1) {
						var total_income_range = 0;
						var total_quantity_range = 0;
						var total_count_range = 0;
						var avg_income_range = 0.0;
						var avg_quantity_range = 0.0;
						var avg_count_range = 0.0;
						const aggregated_menu = [];

						order_data.forEach((element) => {
							var daily_quantity = 0;
							var daily_count = 0;
							var daily_sales = 0;

							element.daily_summary.forEach((summary) => {
								daily_quantity = daily_quantity + summary.order_quantity;
								daily_count = daily_count + summary.order_count;
								daily_sales = daily_sales + summary.total_price;

								var agg_index = aggregated_menu.findIndex(
									(Obj) => Obj.menu_id === summary.menu_id
								);

								if (agg_index === -1) {
									const agg_item = {
										menu_id: String,
										menu_name: String,
										menu_price: String,
										order_quantity: Number,
										order_count: Number,
										total_price: Number,
									};
									agg_item.menu_id = summary.menu_id;
									agg_item.menu_name = summary.menu_name;
									agg_item.menu_price = summary.menu_price;
									agg_item.order_quantity = summary.order_quantity;
									agg_item.order_count = summary.order_count;
									agg_item.total_price = summary.total_price;
									aggregated_menu.push(agg_item);
								} else {
									const agg_item = {
										menu_id: String,
										menu_name: String,
										menu_price: String,
										order_quantity: Number,
										order_count: Number,
										total_price: Number,
									};
									agg_item.menu_id = aggregated_menu[agg_index].menu_id;
									agg_item.menu_name = aggregated_menu[agg_index].menu_name;
									agg_item.menu_price = aggregated_menu[agg_index].menu_price;
									agg_item.order_quantity =
										aggregated_menu[agg_index].order_quantity + summary.order_quantity;
									agg_item.order_count =
										aggregated_menu[agg_index].order_count + summary.order_count;
									agg_item.total_price =
										(aggregated_menu[agg_index].order_quantity + summary.order_quantity) *
										parseInt(aggregated_menu[agg_index].menu_price.replace(',', ''));

									aggregated_menu.splice(agg_index, 1, agg_item);
								}
							});

							element.daily_count = daily_count;
							element.daily_quantity = daily_quantity;
							element.daily_sales = daily_sales;
							element.total_income = daily_sales + element.total_charges;

							total_income_range = total_income_range + element.total_income;
							total_quantity_range = total_quantity_range + element.daily_quantity;
							// total_count_range = total_count_range + element.daily_count;
							total_count_range = orderIdList.length;

							avg_income_range = total_income_range / order_data.length;
							avg_quantity_range = total_quantity_range / order_data.length;
							avg_count_range = total_count_range / order_data.length;
						});

						return res.status(200).json({
							status: 'SUCCESS',
							range_data: {
								total_income_range,
								total_quantity_range,
								total_count_range,
								avg_income_range,
								avg_quantity_range,
								avg_count_range,
								// order_id_list: orderIdList,
								combined_menu: aggregated_menu,
							},
							data: order_data,
						});
					}
				}, timeout);
			});
		} else {
			return res.status(200).json({
				status: 'SUCCESS',
				message: 'No Data Available',
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

async function getPreviousPerformance(req, res) {
	try {
		const { tenant_id, end_date } = req.body;
		const timeoffset = 7 * 60 * 60 * 1000;
		const dateoffset = 24 * 60 * 60 * 1000;
		const monthoffset = 30 * dateoffset;
		const order_data = [];
		const shared_menu = [];

		if (end_date && end_date != '') {
			const checkOrder = await Order.find({
				tenant_id: tenant_id,
				order_status: { $nin: [1, 6] },
				createdAt: {
					$gte: new Date(Date.parse(end_date) - monthoffset - timeoffset),
					$lte: new Date(Date.parse(end_date) - timeoffset),
				},
			});

			if (checkOrder.length > 0) {
				const timeout = checkOrder.length * 275;

				checkOrder.map((order, index) => {
					const selectedDate = new Date(order.order_time).toISOString().split('T')[0];
					const menu_data = [];
					var order_index;

					const order_item = {
						date: String,
						daily_count: Number,
						daily_quantity: Number,
						daily_sales: Number,
						total_tax: Number,
						total_service: Number,
						total_charges: Number,
						total_income: Number,
						daily_summary: Array,
					};

					order.order_menu.forEach((menu) => {
						const menu_item = {
							date: String,
							menu_id: String,
							menu_name: String,
							menu_price: String,
							order_quantity: Number,
							order_count: Number,
							total_price: Number,
						};

						menu_item.date = selectedDate;
						menu_item.menu_id = menu.id;
						menu_item.menu_name = menu.name;
						menu_item.menu_price = menu.price;
						menu_item.order_quantity = menu.orderQuantity;
						menu_item.order_count = 1;
						menu_item.total_price =
							menu.orderQuantity * parseInt(menu.price.replace(',', ''));

						menu_data.push(menu_item);
					});

					order_index = order_data.findIndex((Obj) => Obj.date === selectedDate);

					menu_data.map((element) => {
						var inner_index = shared_menu.findIndex(
							(Obj) => Obj.menu_id === element.menu_id && Obj.date === selectedDate
						);

						if (inner_index === -1) {
							shared_menu.push(element);
						} else {
							const shared_item = {
								date: String,
								menu_id: String,
								menu_name: String,
								menu_price: String,
								order_quantity: Number,
								order_count: Number,
								total_price: Number,
							};

							shared_item.date = shared_menu[inner_index].date;
							shared_item.menu_id = shared_menu[inner_index].menu_id;
							shared_item.menu_name = shared_menu[inner_index].menu_name;
							shared_item.menu_price = shared_menu[inner_index].menu_price;
							shared_item.order_quantity =
								shared_menu[inner_index].order_quantity + element.order_quantity;
							shared_item.order_count = shared_menu[inner_index].order_count + 1;
							shared_item.total_price =
								(shared_menu[inner_index].order_quantity + element.order_quantity) *
								parseInt(shared_menu[inner_index].menu_price.replace(',', ''));

							shared_menu.splice(inner_index, 1, shared_item);
						}
					});

					order_item.date = selectedDate;
					order_item.daily_summary = menu_data;
					order_item.total_tax = order.order_taxcharge;
					order_item.total_service = order.order_servicecharge;
					order_item.total_charges = order.order_taxcharge + order.order_servicecharge;

					if (order_index !== -1) {
						var shared_items = [];

						shared_menu
							.filter((e) => e.date === selectedDate)
							.map((i) => {
								shared_items.push(i);
							});

						order_item.date = selectedDate;
						order_item.daily_summary = shared_items;
						order_item.total_tax = order_data[order_index].total_tax + order.order_taxcharge;
						order_item.total_service =
							order_data[order_index].total_service + order.order_servicecharge;
						order_item.total_charges =
							order_data[order_index].total_charges +
							order.order_taxcharge +
							order.order_servicecharge;
						order_item.total_income =
							order_data[order_index].total_income +
							order.order_taxcharge +
							order.order_servicecharge;

						order_data.splice(order_index, 1);
					}

					order_data.push(order_item);

					setTimeout(() => {
						if (index == checkOrder.length - 1) {
							var total_income_range = 0;
							var total_quantity_range = 0;
							var total_count_range = 0;
							var avg_income_range = 0.0;
							var avg_quantity_range = 0.0;
							var avg_count_range = 0.0;

							order_data.forEach((element) => {
								var daily_quantity = 0;
								var daily_count = 0;
								var daily_sales = 0;

								element.daily_summary.forEach((summary) => {
									daily_quantity = daily_quantity + summary.order_quantity;
									daily_count = daily_count + summary.order_count;
									daily_sales = daily_sales + summary.total_price;
								});

								element.daily_count = daily_count;
								element.daily_quantity = daily_quantity;
								element.daily_sales = daily_sales;
								element.total_income = daily_sales + element.total_charges;

								total_income_range = total_income_range + element.total_income;
								total_quantity_range = total_quantity_range + element.daily_quantity;
								total_count_range = total_count_range + element.daily_count;

								avg_income_range = total_income_range / order_data.length;
								avg_quantity_range = total_quantity_range / order_data.length;
								avg_count_range = total_count_range / order_data.length;
							});

							return res.status(200).json({
								status: 'SUCCESS',
								data: {
									total_income_30day: total_income_range,
									total_quantity_30day: total_quantity_range,
									total_count_30day: total_count_range,
									avg_income_30day: avg_income_range,
									avg_quantity_30day: avg_quantity_range,
									avg_count_30day: avg_count_range,
								},
							});
						}
					}, timeout);
				});
			} else {
				return res.status(200).json({
					status: 'SUCCESS',
					message: 'No Data Available',
				});
			}
		} else {
			return res.status(400).json({
				status: 'FAILED',
				message: 'Invalid Date',
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: 'FAILED',
			message: error.message,
		});
	}
}

export {
	retrieveOrderbyID,
	retrieveOrderbyUserID,
	CreateOrder,
	TenantRetrieveOrder,
	retrieveOrderbyUser,
	TenantEditStatus,
	TenantEditStatusBot,
	TenantRejectOrder,
	TableRetrieveOrder,
	// orderSummary,
	// todaySummary,
	// getPerformance,
	getOrderPerformance,
	getPreviousPerformance,
};
