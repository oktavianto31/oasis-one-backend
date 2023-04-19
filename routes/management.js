import express from "express";
const router = express.Router();

import {ManagementSignIn, ManagementSignUp, RetrieveTenant, TenantAlphabetSort, TenantLocationSort, TenantStatusSort, 
  ClientAlphabetSort, ClientLocationSort, UpdatePassword } from '../controllers/Management/management.js'

//Signin
router.post("/signin", ManagementSignIn);

//SignUp
router.post("/signup", ManagementSignUp);

// Get All Tenant Data
router.get("/user", RetrieveTenant);


  // Filter Tenant by Alphabet (Name)
router.get("/tenant/name/:sortingMethod", TenantAlphabetSort );

  // Filter Tenant by Location (Alphabet jalanan)
router.get("/tenant/location/:sortingMethod", TenantLocationSort );

  // Filter Tenant by Status (open -> close)
router.post("/tenant/status", TenantStatusSort );

  // Tenant Edit Profile (Take from tenant)


  // Filter Customer by Alphabet (Name)
router.get("/client/name/:sortingMethod", ClientAlphabetSort );

  // Filter Customer by Location (Last tenant Name)
router.get("/client/location/:sortingMethod", ClientLocationSort );
  
// Get password
router.post("/updatepassword", UpdatePassword );
  
    
export default router;
