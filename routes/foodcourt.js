import express from "express";
const router = express.Router();

import { 
    createFoodcourt,
    retrieveFoodCourt,
    retrieveFoodCourtbyID,
    FoodcourtAlphabetSort,
    FoodcourtAddressSort,
    FoodcourtLocationSort,
    FoodcourtTenantAlphabetSort,
    FoodcourtTenantAddressSort,
    FoodcourtTenantLocationSort,
    editFoodcourt,
    deleteFoodcourt,
    addTenant,
    removeTenant,
} from '../controllers/Foodcourt/foodcourt.js';

// Create Foodcourt
router.post("/create", createFoodcourt );

// Retrieve All Foodcourt
router.get('/retrieve/all', retrieveFoodCourt );

// Retrieve Foodcourt by ID
router.get('/retrieve/:foodcourt_id', retrieveFoodCourtbyID );

// Sort Foodcourt by Name
router.get('/sort/name/:sortingMethod', FoodcourtAlphabetSort );

// Sort Foodcourt by Address
router.get('/sort/address/:sortingMethod', FoodcourtAddressSort );

// Sort Foodcourt by Location
router.get('/sort/location/:sortingMethod', FoodcourtLocationSort );

// Sort Foodcourt Tenant by Name
router.get('/sort/tenant/name/:foodcourt_id/:sortingMethod', FoodcourtTenantAlphabetSort );

// Sort Foodcourt Tenant by Address
router.get('/sort/tenant/address/:foodcourt_id/:sortingMethod', FoodcourtTenantAddressSort );

// Sort Foodcourt Tenant by Location
router.get('/sort/tenant/location/:foodcourt_id/:sortingMethod', FoodcourtTenantLocationSort );

// Edit Foodcourt by ID
router.post('/edit/:foodcourt_id', editFoodcourt );

// Delete Foodcourt
router.post('/delete/:foodcourt_id', deleteFoodcourt );

// Add new tenant to list
router.post('/addtenant/:foodcourt_id', addTenant );

// Remove tenant from list
router.post('/removetenant/:foodcourt_id', removeTenant );


export default router;