import User from '../../models/userModel.js';

import getRandomString from "randomstring";

async function Register(req, res) {
    try {
        const { name, phoneNumber } = req.body;
        let UserID;
  	    let tempId = getRandomString.generate(8);

		const existingId = User.findOne({ user_id: "C-" + tempId });
		if ( existingId === "C-" + tempId ) {
			tempId = new getRandomString.generate(8);
			return tempId;
		}
        
        UserID = "C-" + tempId;

        const newUser = new User({
            user_id : UserID,
            name    : name,
            phoneNumber : phoneNumber,
        })

        // await newUser.save();

        return res.status(200).json({
            status  : "SUCCESS",
            message : "User has been created",
            data    : newUser,
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
          status  : "FAILED",
          message : error.message 
        });
    }
}

export { Register };