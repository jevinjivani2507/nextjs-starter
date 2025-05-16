import mongoose, { Schema, model, models } from "mongoose";
import { Todo } from "@/types/Todo";

const TodoSchema: Schema = new Schema<Todo>(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const TodoModel = models?.Todo || model<Todo>("Todo", TodoSchema);

export default TodoModel;
