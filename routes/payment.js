import express from "express";
const router = express.Router();

import { 
	requestPayOpsSignature,
	requestPaymentStatus,
    hostPaymentNotification
} from '../controllers/Payment/payment.js';

// Request Payment Operation Signature
router.post("/signature/payment-operations", requestPayOpsSignature );

// Request Payment Status
router.post("/signature/payment-status", requestPaymentStatus );

// Request Payment Notification Signature
router.post("/payment-notification", hostPaymentNotification );


export default router;