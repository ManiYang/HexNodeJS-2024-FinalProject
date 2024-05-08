const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        image: {
            type: String,
            default: "",
        },
        content: {
            type: String,
            required: [true, "貼文內容 content 未填寫"],
        },
        createAt: {
            type: Date,
            default: Date.now
        },
        likes: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }]
    },
    // schema options:
    {
        versionKey: false
    }
);

const postModel = mongoose.model("Post", postSchema);

module.exports = postModel;
