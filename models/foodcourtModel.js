import mongoose from "mongoose";

const foodcourtSchema = mongoose.Schema(
  {
    foodcourt_id: {
      type      : String,
      required  : true,
    },
    foodcourt_name: {
      type      : String,
      required  : true,
    },
    foodcourt_color: {
      type      : String, 
      required  : true,
      default   : "#424242",
    },
    foodcourt_logo: {
      type      : String, 
      required  : true,
      default   : 'https://backend.oasis-one.com/api/images/foodcourt/render/default_avatar.jpg',
    },
    foodcourt_location: {
      type      : String,
      required  : true,
      default   : "please input location"
    },
    foodcourt_address: {
      type      : String,
      required  : true,
      default   : "please input detail address",
    },
    qrCode  : {
      type      : String,
      required  : true
    },
    tenant_list: [
      {
        tenant_id: {
          type  : String,
        },
        tenant_name: {
          type  : String,
        },
        tenant_address: {
          type  : String,
        },
        tenant_location: {
          type  : String,
        },
      }
    ]
  },
  {
    timestamps: true,
  }
);

const FoodCourt = mongoose.model("Food Court", foodcourtSchema);

export default FoodCourt;
