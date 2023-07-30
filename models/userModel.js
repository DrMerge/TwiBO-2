const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  phone_No: {
    type: String,
    required: true,
  },
  phone_NoVerfied: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  refreshToken: String,
  total_CP: { type: Number, default: 0 },
  botOn: {
    type: Boolean,
    default: false,
  },

  NODE_ENV: {
    type: String,
    defaut: "development",
  },

  APIKEY: {
    type: String,
  },
  APISECRET: {
    type: String,
  },
  ACCESSTOKEN: {
    type: String,
  },
  ACCESSSECRET: {
    type: String,
  },

  prompt: {
    type: String,
  },
  tweetInterval: {
    type: Number,
  },
  tweet: {
    type: Array,
  },
});

module.exports = mongoose.model("Twib_user", UserSchema);
