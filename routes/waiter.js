import express from 'express';
const router = express.Router();

import {
	WaiterCalled,
	RetrieveWaiter,
	RemoveWaiterCall,
} from '../controllers/Waiter/Waiter.js';

// Waiter Call
router.post('/:tenant_id', WaiterCalled);

// Retrieve
router.post('/retrieve/:tenant_id', RetrieveWaiter);

// Remove
router.post('/remove/:tenant_id', RemoveWaiterCall);

export default router;
