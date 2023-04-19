import express from "express";
const router = express.Router();

import { 
    CreateUserID, RetrieveUser
} from '../controllers/User/user.js';

// Create User ID
router.post('/create', CreateUserID );

// // Retrieve FoodCourt List
// router.get('/:foodcourtID', RetrieveFoodCourtTenant);

// Retrieve
router.get("/retrieve", RetrieveUser );

export default router;