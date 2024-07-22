const mongoose = require("mongoose");
const Counter = require("./Counter");

const PRIORITIES = ["normal", "importante", "urgente"];
const CATEGORIES = [
  "hogar",
  "trabajo",
  "hobby",
  "compras",
  "salidas",
  "viajes",
];

const TaskSchema = new mongoose.Schema({
  taskId: { type: Number, unique: true },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  completed: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: PRIORITIES,
    default: "normal",
  },
  category: {
    type: String,
    enum: CATEGORIES,
    required: true,
  },
  imageUrl: { type: String }, // Nuevo campo para la URL de la imagen
  createdAt: { type: Date, default: Date.now },
});

TaskSchema.pre("save", function (next) {
  if (this.isNew) {
    Counter.findByIdAndUpdate(
      { _id: "taskId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )
      .then((counter) => {
        this.taskId = counter.seq;
        next();
      })
      .catch((error) => next(error));
  } else {
    next();
  }
});

module.exports.CATEGORIES = CATEGORIES;
module.exports.PRIORITIES = PRIORITIES;

module.exports = mongoose.model("Task", TaskSchema);
