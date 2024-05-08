const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        nickname: {
            type: String,
            required: [true, "使用者暱稱 nickname 未填寫"],
        },
        email: {
            type: String,
            required: [true, "使用者 email 未填寫"],
            unique: true,
            select: false
        },
        photo: {
            type: String,
            default: ""
        },
        createdAt: {
            type: Date,
            default: Date.now,
            select: false
        }
    },
    // schema options:
    {
        versionKey: false
    }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
