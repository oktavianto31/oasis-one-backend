import express from 'express';
const router = express.Router();

import {
	retrieveOrderbyID,
	retrieveOrderbyUserID,
	CreateOrder,
	TenantRetrieveOrder,
	TenantEditStatus,
	TenantEditStatusBot,
	TenantRejectOrder,
	TableRetrieveOrder,
	retrieveOrderbyUser,
	// orderSummary,
	// todaySummary,
	// getPerformance,
	getOrderPerformance,
	getPreviousPerformance,
} from '../controllers/Order/orderdata.js';

// Retreive order by order_id
router.get('/:order_id', retrieveOrderbyID);

// Retrieve order by user_id
router.get('/user/:user_id', retrieveOrderbyUserID);

// Order
router.post('/create', CreateOrder);

// Retreive
router.get('/retrieve/:tenant_id', TenantRetrieveOrder);

// Table Retreive
router.post('/table/retrieve/:tenant_id', TableRetrieveOrder);

// Retreive by User
router.post('/user/retrieve/:tenant_id', retrieveOrderbyUser);

// Edit
router.post('/edit/:tenant_id/:order_id', TenantEditStatus);

// Edit Bot
router.get('/botedit/:tenant_id/:order_id/:order_status/:order_table', TenantEditStatusBot);

// Reject
router.post('/reject/:tenant_id/:order_id', TenantRejectOrder);

// Order summary
// router.post('/summary', orderSummary);

// Order summary
// router.post('/summary/today', todaySummary);

// Order summary
// router.post('/get-performance', getPerformance);

// Order summary
router.post('/get-performance', getOrderPerformance);

// Order Summary
router.post('/get-previous-performance', getPreviousPerformance);

export default router;
