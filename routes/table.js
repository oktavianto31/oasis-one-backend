import express from "express";
const router = express.Router();

import { 
    CreateTables, GetTables, DuplicateTables, RemoveTableContent, RemoveTable
} from '../controllers/Tables/Tables.js';

// Get Table
router.get("/:tenant_id", GetTables);

// Add Table
router.post("/create/:tenant_id", CreateTables );

// Duplicate Table
router.post("/duplicate/:tenant_id", DuplicateTables );

// Remove Table Content
router.post("/remove/content/:tenant_id", RemoveTableContent );

// Delete Table
router.post("/remove/:tenant_id", RemoveTable );



export default router; 