import Payment from "../../models/paymentModel.js";
import Order from "../../models/orderModel.js";
import crypto from "crypto"

function createHash ( data ) {
  	return crypto.createHash('sha1').update(data).digest('hex');
}

async function requestPayOpsSignature( req, res ) {
	try {
		const { order_id, amount } = req.body;

		const signatures    = order_id + process.env.CLIENT_KEY + amount; 
		const signatureHash = createHash( signatures )

		const checkOrder 	= await Order.findOne({ order_id: order_id });
		const checkPayment 	= await Payment.findOne({ order_id	: order_id });

		if ( checkOrder ) {
			if ( checkPayment ) {
				await Payment.updateOne({
					order_id: order_id,
				}, {
					$set: {
						payment_amount		: parseInt( amount ),
						payment_status		: "PENDING",
						payment_signature	: signatureHash,
					},
				})
			} else {
				const newPayment = new Payment({
					order_id        	: order_id,
					payment_amount  	: parseInt( amount ),
					payment_status  	: "PENDING",
					payment_signature	: signatureHash,
				})
				await newPayment.save()
			}

			// if ( checkOrder.order_total == amount ) {
				return res.status(200).json({
					status  : "SUCCESS",
					message : "Order has been updated",
					data    : {
						url			: "https://api.onesmile.digital/digital-product/payment-link/channel?signature=" 
							+ signatureHash 
							+ "&amount=" + parseInt(amount) 
							+ "&order_id=" + order_id 
							+ "&client_id=" + process.env.CLIENT_ID,
						signature   : signatureHash,
						amount      : parseInt( amount ),
						order_id    : order_id,
						client_id   : process.env.CLIENT_ID
					}
				});
			// } else {
			// 	return res.status(404).json({
			// 		status  : "FAILED",
			// 		message : "Order total does not match",
			// 	});
			// }

		} else {
			return res.status(404).json({
				status  : "FAILED",
				message : "Order does not exists",
			});
		}

	} catch (error) {
		console.log(error);
		res.status(500).json({
			status  : "FAILED",
			message : error.message,
		});
	}
}

async function requestPaymentStatus( req, res ) {
	try {
		const { order_id, amount } = req.body;

		const signatures    = order_id + process.env.CLIENT_KEY + amount; 
		const signatureHash = createHash( signatures )

		const checkOrder = await Order.findOne({ order_id: order_id });

		if ( checkOrder ) {
			return res.status(200).json({
					status  : "SUCCESS",
					message : "Order has been updated",
					data    : {
						url			: "https://api.onesmile.digital/digital-product/payment-link/status?signature=" 
								+ signatureHash 
								+ "&order_id=" + order_id 
								+ "&client_id=" + process.env.CLIENT_ID,
						signature   : signatureHash,
						order_id    : order_id,
						client_id   : process.env.CLIENT_ID
					}
			});
		} else {
			return res.status(404).json({
				status  : "FAILED",
				message : "Order does not exists",
			});
		}

	} catch (error) {
		console.log(error);
		res.status(500).json({
			status  : "FAILED",
			message : error.message,
		});
	}
}


async function hostPaymentNotification( req, res ) {
	try {
		const { signature, order_id, status, client_id } = req.query;

		const checkOrder 	= await Order.findOne({ order_id: order_id });
		const checkPayment 	= await Payment.findOne({ order_id	: order_id });

		if ( client_id == process.env.CLIENT_ID ) {

			if ( checkOrder ) {
				if ( checkPayment.payment_signature == signature ) {
					return res.status(200).json({
						status  : "SUCCESS",
						message : "Payment status = " + status,
					});
				} else {
					return res.status(404).json({
						status  : "FAILED",
						message : "Payment Signature does not match",
					});
				}

			} else {
				return res.status(404).json({
					status  : "FAILED",
					message : "Order does not exists",
				});
			}

		} else {
			return res.status(404).json({
				status  : "FAILED",
				message : "Client ID does not match",
			});
		}

	} catch (error) {
		console.log(error);
		res.status(500).json({
			status  : "FAILED",
			message : error.message,
		});
	}
}

export {
	requestPayOpsSignature,
	requestPaymentStatus,
	hostPaymentNotification
}