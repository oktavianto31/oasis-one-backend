import mongoose from "mongoose";

const WebTrackSchema = mongoose.Schema(
    {
        tracking_id: {
            type    : String,
            required: true,
        },
        tracking_page: {
            type    : String,
            required: true,
        },
        tracking_event: {
            type    : String,
            required: true,
        },
        user_id: {
            type    : String,
            required: false,
        },
        timestamp: {
            type    : Date,
            required: true,
        },
    },
);

const WebTracking = mongoose.model("WebTracking", WebTrackSchema);

export default WebTracking;