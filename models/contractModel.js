import mongoose from "mongoose";

const contractSchema = mongoose.Schema(
  {
    tenant_id: {
      type: String,
      required: true,
    },
    start_Date: {
        type: Date,
        required: true,
    },
    contract_Period: {
      type: Number,
      required: true,
    },
    contract_File: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;
