import mongoose from "mongoose";

const passwordResetSchema = mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    resetString: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
);

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;