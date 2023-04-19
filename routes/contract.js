import express from "express";
const router = express.Router();

import { 
    CreateContract, GetContractDetails, EditContract, RemoveContract
  } from '../controllers/Contract/contract.js';
  
  // Create Contract
router.post("/create/:tenant_id", CreateContract);

// Get Contract
router.get("/retrieve/:tenant_id", GetContractDetails);

// Edit Contract
router.post("/edit/:tenant_id", EditContract);


// Remove Contract
router.post("/remove/:tenant_id", RemoveContract);

export default router;