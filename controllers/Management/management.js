import express from "express";
import getRandomString from "randomstring";

// mongodb models
import User from "../../models/userModel.js";
import Tenant from "../../models/tenantModel.js";
import Management from "../../models/managementModel.js";

// env variables
import "dotenv/config";

//password handler
import bcrypt from "bcryptjs";

//path for static verified page
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// sign in
async function ManagementSignIn(req, res) {
  try {
    let { email, password } = req.body;

    if (email == "" || password == "") {
      res.json({
        status: "FAILED",
        message: "Empty credentials supplied",
      });
    } else {
      //Check if user exist

      Management.find({ email })
        .then((data) => {
          if (data.length) {
            const hashedPassword = data[0].password;
            bcrypt
              .compare(password, hashedPassword)
              .then((result) => {
                if (result) {
                  //Password match
                  res.json({
                    status: "SUCCESS",
                    message: "Signin successful",
                    data: data,
                  });
                } else {
                  res.json({
                    status: "FAILED",
                    message: "Invalid password entered!",
                  });
                }
              })
              .catch((err) => {
                res.json({
                  status: "FAILED",
                  message: "An error occured while comparing password",
                });
              });
          } else {
            res.json({
              status: "FAILED",
              message: "Invalid credentials entered!",
            });
          }
        })
        .catch((err) => {
          res.json({
            status: "FAILED",
            message: "An error occured while checking for existing user",
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

// sign up
async function ManagementSignUp(req, res) {
  try {
    let { name, email, password } = req.body;
    let ManagementID;
    let tempId = getRandomString.generate(8);

    const existingId = Management.findOne({ management_id: "M-" + tempId });
    if (existingId === "M-" + tempId) {
      tempId = new getRandomString.generate(8);
      return tempId;
    }

    ManagementID = "M-" + tempId;

    if (name == "" || email == "" || password == "") {
      res.json({
        status: "FAILED",
        message: "Empty input fields!",
      });
    } else if (!/^[a-zA-Z]*$/.test(name)) {
      res.json({
        status: "FAILED",
        message: " Invalid name entered",
      });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      res.json({
        status: "FAILED",
        message: " Invalid email entered",
      });
    } else if (password.length < 8) {
      res.json({
        status: "FAILED",
        message: " Password is too short",
      });
    } else {
      //checking if user already exists
      Management.find({ email }).then((result) => {
        if (result.length) {
          //A user already exists
          res.json({
            status: "FAILED",
            message: "User with the provided email already exists",
          });
        } else {
          //Try to create a new user

          //Password handler
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newManagement = new Management({
                management_id: ManagementID,
                name,
                email,
                password: hashedPassword,
              });

              newManagement
                .save()
                .then((result) => {
                  res.json({
                    status: "SUCCESS",
                    message: "Signup sucessfull",
                    data: result,
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.json({
                    status: "FAILED",
                    message: "An error occured while saving password!",
                  });
                });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: "FAILED",
                message: "An error occured while hashing password!",
              });
            });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: "FAILED",
      message: "An error occured while checking for existing user!",
    });
  }
}

// retrieve all tenant
async function RetrieveTenant(req,res){
  try {
    // Find Tenant
    const checkTenant = await Tenant.find();

    if (checkTenant) {
      return res.status(200).json({
        status: "SUCCESS",
        message: "Tenant has been found",
        data: checkTenant,
      });
    } else {
      return res.status(404).json({
        status: "FAILED",
        message: "Tenant is not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

// sort tenant alphabetically
async function TenantAlphabetSort(req, res) {
  try {
    const { sortingMethod } = req.params;

    if (sortingMethod == "ascending") {
      const sort = await Tenant.aggregate([{ $sort: { name: 1 } }]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    } else {
      const sort = await Tenant.aggregate([{ $sort: { name: -1 } }]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

async function TenantLocationSort(req, res) {
  try {
    const { sortingMethod } = req.body;

    if (sortingMethod == "ascending") {
      const sort = await Tenant.aggregate([{ $sort: { address: 1 } }]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    } else {
      const sort = await Tenant.aggregate([{ $sort: { address: -1 } }]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

async function TenantStatusSort(req, res) {
  try {
    const { sortingDays } = req.body;

    if (sortingDays == "Monday") {

      const sort = await Tenant.aggregate([
        { $sort: { "openingDays.0.isClosed": 1 } },
      ]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    } else if (sortingDays == "Tuesday") {
      const sort = await Tenant.aggregate([
        { $sort: { "openingDays.1.isClosed": 1 } },
      ]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    } else if (sortingDays == "Wednesday") {
      const sort = await Tenant.aggregate([
        { $sort: { "openingDays.2.isClosed": 1 } },
      ]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    } else if (sortingDays == "Thursday") {
      const sort = await Tenant.aggregate([
        { $sort: { "openingDays.3.isClosed": 1 } },
      ]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    } else if (sortingDays == "Friday") {
      const sort = await Tenant.aggregate([
        { $sort: { "openingDays.4.isClosed": 1 } },
      ]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    } else if (sortingDays == "Saturday") {
      const sort = await Tenant.aggregate([
        { $sort: { "openingDays.5.isClosed": 1 } },
      ]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    } else if (sortingDays == "Sunday") {
      const sort = await Tenant.aggregate([
        { $sort: { "openingDays.6.isClosed": 1 } },
      ]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

async function ClientAlphabetSort(req, res) {
  try {
    const { sortingMethod } = req.params;

    if (sortingMethod == "ascending") {
      const sort = await User.aggregate([{ $sort: { name: 1 } }]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    } 
    else {
      const sort = await User.aggregate([{ $sort: { name: -1 } }]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

async function ClientLocationSort(req, res) {
  try {
    const { sortingMethod } = req.params;

    if (sortingMethod == "ascending") {
      const sort = await User.aggregate([
  
        {$sort: { "history.tenant_name": 1 } },
        
       ]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    } else {
      const sort = await User.aggregate([
        {$sort: { "history.tenant_name": -1 } },
        
      ]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Order has been placed",
        data: sort,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

async function UpdatePassword(req, res) {
  try {
    const { tenant_id, newPassword } = req.body;

    const saltRounds = 10;
    bcrypt
      .hash(newPassword, saltRounds)
      .then((hashedNewPassword) => {
        //update user password

        Tenant.updateOne(
          { tenant_id: tenant_id },
          { password: hashedNewPassword, uniqueKey: newPassword }
        )
          .then(() => {

            const newData = Tenant.find({tenant_id:tenant_id}, {uniqueKey: 1, _id: 0})
            
            res.json({
              status: "SUCCESS",
              message: "Password has been reset successfully.",
              data: newData,
            });
          })

          .catch((error) => {
            console.log(error);
            res.json({
              status: "FAILED",
              message: "Updating user password failed.",
            });
          });
      })
      .catch((error) => {
        console.log(error);
        res.json({
          status: "FAILED",
          message: "An error occured while hashing new password.",
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

export {
    ManagementSignUp,
  ManagementSignIn,
  RetrieveTenant,
  TenantAlphabetSort,
  TenantLocationSort,
  TenantStatusSort,
  ClientAlphabetSort,
  ClientLocationSort,
  UpdatePassword
};
