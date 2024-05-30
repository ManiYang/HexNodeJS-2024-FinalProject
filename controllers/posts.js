const Post = require('../model/posts');
const User = require('../model/users');
const { operationalError } = require('../services/errorHandling');
const { respondSuccess } = require('../services/response');

module.exports = {
    getPosts: async (req, res, next) => {
        isTimeSortAscending = (req.query.timeSort === 'asc');
        searchPattern = req.query.q;

        const posts = await Post.find(
            (searchPattern !== undefined)
            ? { content: new RegExp(searchPattern) }
            : {}
        ).populate({
            path: 'user',
            select: 'nickname photo'
        }).sort(
            { createAt: (isTimeSortAscending ? 1 : -1) }
        );

        respondSuccess(res, 200, posts);
    },

    createPost: async (req, res, next) => {
        req.body.user = req.authenticatedUser.id;
        req.body.likes = [];
    
        //
        const newPost = await Post.create(req.body);
        respondSuccess(res, 201, newPost);
    },

    deletePost: async (req, res, next) => {
        const result = await Post.findByIdAndDelete(req.params.id);
        if (result === null) {
            throw operationalError(400, '找不到指定 ID 的貼文');
        }
        respondSuccess(res, 200, result);
    },

    deleteAllPosts: async (req, res, next) => {
        const result = await Post.deleteMany({});
        respondSuccess(res, 200, result);
    },
 
    updatePost: async (req, res, next) => {
        if (req.body.user !== undefined) {
            throw new operationalError(400, '發文者 user 不可更改');
        }
        if (req.body.createdAt != undefined) {
            throw operationalError(400, 'createdAt 不可更改');
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { new: true, runValidators: true }
        );
        if (updatedPost === null) {
            throw operationalError(400, '貼文不存在');
        }

        respondSuccess(res, 200, updatedPost);
    },
};
