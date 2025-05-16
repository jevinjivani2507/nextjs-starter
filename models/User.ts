import { Schema, model, models } from "mongoose";

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

const UserModel = models?.User || model<User>("User", UserSchema);

export default UserModel;
