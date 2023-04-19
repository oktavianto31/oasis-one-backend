import mongoose from "mongoose";

const openingHoursSchema = mongoose.Schema(
  {
    tenant_id: {
        type: String,
        required: true,
    },
    Monday: { 
        is24Hours : { type: Boolean, default: false },
        isOpen    : { type: Boolean, default: true },
        OpenHour  : { type: String, default: "00" },
        OpenMins  : { type: String, default: "00" },
        OpenTF    : { type: String, default: "AM" },
        CloseHour : { type: String, default: "00" },
        CloseMins : { type: String, default: "00" },
        CloseTF   : { type: String, default: "PM" },
    },
    Tuesday: { 
        is24Hours : { type: Boolean, default: false },
        isOpen    : { type: Boolean, default: true },
        OpenHour  : { type: String, default: "00" },
        OpenMins  : { type: String, default: "00" },
        OpenTF    : { type: String, default: "AM" },
        CloseHour : { type: String, default: "00" },
        CloseMins : { type: String, default: "00" },
        CloseTF   : { type: String, default: "PM" },
    },
    Wednesday: { 
        is24Hours : { type: Boolean, default: false },
        isOpen    : { type: Boolean, default: true },
        OpenHour  : { type: String, default: "00" },
        OpenMins  : { type: String, default: "00" },
        OpenTF    : { type: String, default: "AM" },
        CloseHour : { type: String, default: "00" },
        CloseMins : { type: String, default: "00" },
        CloseTF   : { type: String, default: "PM" },
    },
    Thursday: { 
        is24Hours : { type: Boolean, default: false },
        isOpen    : { type: Boolean, default: true },
        OpenHour  : { type: String, default: "00" },
        OpenMins  : { type: String, default: "00" },
        OpenTF    : { type: String, default: "AM" },
        CloseHour : { type: String, default: "00" },
        CloseMins : { type: String, default: "00" },
        CloseTF   : { type: String, default: "PM" },
    },
    Friday: { 
        is24Hours : { type: Boolean, default: false },
        isOpen    : { type: Boolean, default: true },
        OpenHour  : { type: String, default: "00" },
        OpenMins  : { type: String, default: "00" },
        OpenTF    : { type: String, default: "AM" },
        CloseHour : { type: String, default: "00" },
        CloseMins : { type: String, default: "00" },
        CloseTF   : { type: String, default: "PM" },
    },
    Saturday: { 
        is24Hours : { type: Boolean, default: false },
        isOpen    : { type: Boolean, default: true },
        OpenHour  : { type: String, default: "00" },
        OpenMins  : { type: String, default: "00" },
        OpenTF    : { type: String, default: "AM" },
        CloseHour : { type: String, default: "00" },
        CloseMins : { type: String, default: "00" },
        CloseTF   : { type: String, default: "PM" },
    },
    Sunday: { 
        is24Hours : { type: Boolean, default: false },
        isOpen    : { type: Boolean, default: true },
        OpenHour  : { type: String, default: "00" },
        OpenMins  : { type: String, default: "00" },
        OpenTF    : { type: String, default: "AM" },
        CloseHour : { type: String, default: "00" },
        CloseMins : { type: String, default: "00" },
        CloseTF   : { type: String, default: "PM" },
    }
},
{
timestamps: true,
}
);

const OpeningHours = mongoose.model("Opening Hours", openingHoursSchema);

export default Tenant;
