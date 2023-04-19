import WebTracking from "../../models/webTrackingModel.js";
import getRandomString from "randomstring";

async function CreateWebTracking ( req, res ) {
    try {
        const { page, event, user_id } = req.body;

        let tracking_id;
        let tempId = getRandomString.generate(8);

		const existingId = await WebTracking.findOne({ tracking_id: "TRK - " + tempId });
		if ( existingId === "TRK - " + tempId ) {
			tempId = new getRandomString.generate(8);
			return tempId;
		}

        tracking_id = "T-" + tempId;

        const newTracking = new WebTracking({
            tracking_id,
            tracking_page   : page,
            tracking_event  : event,
            user_id,
            timestamp       : Date.now(),
        })
        await newTracking.save()

        if ( newTracking ) {
            const retrieveTracking = await WebTracking.findOne({ tracking_id });
            return res.status(200).json({
                status  : "SUCCESS",
                message : "Tracking has been created with ID: " + tracking_id,
                data    : retrieveTracking,
            });
        } else {
            return res.status(404).json({
                status  : "FAILED",
                message : "New tracking failed to be created",
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

async function RetrieveWebTracking ( req, res ) {
    try {
        const getTracking = await WebTracking.find();

        if ( getTracking ) {
            return res.status(200).json({
              status    : "SUCCESS",
              message   : "Data tracking has been found",
              data      : getTracking,
            });
          } else {
            return res.status(404).json({
              status    : "FAILED",
              message   : "Data tracking is not found",
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

export {
    CreateWebTracking,
    RetrieveWebTracking
}