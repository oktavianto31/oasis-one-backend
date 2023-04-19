import mongoose from "mongoose";

const callWaiterSchema = mongoose.Schema(
  {
    tenant_id: {
      type: String,
      required: true,
    },
    waiter: [
      {
        user_id: {
          type: String,
          required: true,
        },
        user_name: {
          type: String,
          required: false,
          default: '-'
        },
        user_phonenumber: {
          type: String,
          required: false,
          default: '-'
        },
        order_instruction: {
          type: String,
          required: false,
        },
        order_table: {
          type: String,
          required: true
        },
        user_guest: {
          type: String,
          required: false,
          default: '-'
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CallWaiter = mongoose.model("CallWaiter", callWaiterSchema);

export default CallWaiter;
