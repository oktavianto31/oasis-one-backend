import express from "express";
const router = express.Router();

import { 
    CreateWebTracking,
    RetrieveWebTracking,
} from '../controllers/WebTracking/webtracking.js';

// Create Web Tracking
router.post("/create", CreateWebTracking );

// Retreive Web Tracking
router.get ("/retrieve", RetrieveWebTracking );

export default router;