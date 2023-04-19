import User from "../../models/userModel.js";
import Tenant from "../../models/tenantModel.js";
import getRandomString from "randomstring";

// Create UserID
async function CreateUserID( req, res ) {
  try {
    let tempId = getRandomString.generate(8);

    const checkExistingUser   = User.findOne({ 
      user_id : "U-" + tempId 
    })
    
    if ( checkExistingUser == "U-" + tempId ) {
      tempId  = new getRandomString.generate(8);
      return tempId;
    }

    let user_id = "U-" + tempId;

    const newUser = new User({
      user_id   : user_id,
    });
    await newUser.save();

    return res.status(200).json({
      status  : "SUCCESS",
      message : "User has been created",
      data    : newUser,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status  : "FAILED",
      message : error.message,
    });
  }
}

// retrieve user
async function RetrieveUser(req, res) {
  try {
    // const existingUser = await User.find();

    const existingUser = await User.aggregate([
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    return res.status(200).json({
      status  : "SUCCESS",
      message : "User has been retrieved",
      data    : existingUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status  : "FAILED",
      message : error.message,
    });
  }
}

async function RetrieveFoodCourtTenant(req, res) {
  try {
    const { foodcourtID } = req.body;

    const getTenant = await Tenant.aggregate([
      { $unwind: "$foodcourt_list" },
      { $match: { "foodcourt_list.foodcourt_id": foodcourtID } },
    ]);

    return res.status(200).json({
      status  : "SUCCESS",
      message : "Tenant list has been retrieved",
      data    : getTenant,
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
  CreateUserID,
  RetrieveUser, 
  RetrieveFoodCourtTenant,
};
