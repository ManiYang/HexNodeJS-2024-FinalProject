const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, '留言內容不可空白']
        },
        post: {
            type: mongoose.Schema.ObjectId,
            ref: 'Post',
            required: [true, '貼文 post 未指定']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, '使用者 user 未指定']
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    },
    // schema options:
    {
        versionKey: false,
        id: false
    }
);

commentSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'nickname photo'
    });
    next();
});

const commentModel = mongoose.model('Comment', commentSchema);

module.exports = commentModel;
