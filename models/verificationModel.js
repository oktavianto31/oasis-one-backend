import mongoose from "mongoose";

const verificationSchema = mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    uniqueString: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
);

const Verification = mongoose.model("Verification", verificationSchema);

export default Verification;
