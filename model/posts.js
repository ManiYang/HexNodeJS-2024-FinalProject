const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, '使用者 user 未指定']
        },
        type: {
            type: String,
            enum: ["group", "person"],
            required: [true, "貼文類型 type 未填寫"],
        },
        tags: [{
            type: String,
            required: [true, '標籤 tag 不可空白']
        }],
        image: {
            type: String,
            default: '',
        },
        content: {
            type: String,
            required: [true, '貼文內容 content 未填寫'],
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        likes: [{
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: [true, '使用者 user 未提供']
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            _id: false
        }]
    },
    // schema options:
    {
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        id: false
    }
);

postSchema.virtual('likesCount').get(function () {
    return this.likes?.length;
});

postSchema.virtual('comments', {
    ref: 'Comment',
    foreignField: 'post',
    localField: '_id'
});

const postModel = mongoose.model('Post', postSchema);

module.exports = postModel;
