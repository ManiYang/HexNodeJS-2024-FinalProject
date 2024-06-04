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
        passwordHash: {
            type: String,
            required: [true, "使用者密碼未填寫"],
            select: false
        },
        photo: {
            type: String,
            default: ""
        },
        gender: {
            type: String,
            enum: ["male", "female", "na"],  
            default: "na"
        },
        createdAt: {
            type: Date,
            default: Date.now,
            select: false
        },
        followers: [{
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        following: [{
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
    },
    // schema options:
    {
        versionKey: false
    }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
