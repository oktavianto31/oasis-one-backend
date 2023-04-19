import express from "express";
const router = express.Router();

import { 
    CreateCategories, GetCategory, EditCategory, DeleteCategory,
    EditCategoryIndex, CreateMenu, GetAllMenu, GetMenu, EditMenu, DeleteMenu,
} from '../controllers/Menu/menu.js';


// Get Category
router.get("/category/:tenant_id", GetCategory);

// Add Category
router.post("/category/create/:tenant_id", CreateCategories );

// Edit Category
router.post("/category/edit/:tenant_id", EditCategory );

// Edit Category Index
router.post("/category/edit/index/:tenant_id", EditCategoryIndex );

// Delete Category
router.post("/category/delete/:tenant_id/:cat_id", DeleteCategory );


// Get All Menu
router.get("/all/:tenant_id", GetAllMenu );

// Get Menu
router.get("/:tenant_id/:menu_id", GetMenu );

// Add Menu
router.post("/create/:tenant_id", CreateMenu );

// Edit Menu
router.post("/edit/:tenant_id", EditMenu );

// Delete Menu
router.post("/delete/:tenant_id/:menu_id", DeleteMenu );

export default router; 