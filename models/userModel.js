const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordChangedAt: Date,
    PasswordResetCode: String,
    PasswordResetCodeExpire: Date,
    PasswordResetVerified: Boolean,
    profilePic: {
      type: String,
      default: "",
    },
    coverPic: {
      type: String,
      default: "",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    desc: {
      type: String,
    },
    from: {
      type: String,
    },
    relationship: {
      type: Number,
      enum: [1, 2, 3],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    id: false,
  }
);

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "userId",
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 12);
  next();
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
