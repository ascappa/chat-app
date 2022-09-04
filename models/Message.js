const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    presenceChange: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;