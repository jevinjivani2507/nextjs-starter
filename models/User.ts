import mongoose, { Schema } from "mongoose";

export interface User {
  googleId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatar?: string;
}

const UserSchema: Schema = new Schema<User>({
  googleId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String },
});

const UserModel =
  mongoose?.models?.User || mongoose.model<User>("User", UserSchema) || null;

export default UserModel;
