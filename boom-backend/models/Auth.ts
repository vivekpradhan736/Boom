import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

// 1. Define the interface for the Auth document
export interface IAuth extends Document {
  email: string;
  password: string;
  comparePassword(password: string): Promise<boolean>;
}

// 2. Define the schema
const authSchema = new Schema<IAuth>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// 3. Pre-save hook to hash password
authSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// 4. Instance method
authSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

// 5. Export the model with the correct type
export const Auth: Model<IAuth> = mongoose.model<IAuth>("Auth", authSchema);
