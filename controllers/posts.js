const Comment = require('../model/comments');
const Post = require('../model/posts');
// const User = require('../model/users');
const { operationalError } = require('../services/errorHandling');
const { respondSuccess } = require('../services/response');

module.exports = {
    async getPosts (req, res, next) {
        isTimeSortAscending = (req.query.timeSort === 'asc');
        searchPattern = req.query.q;

        const posts = await Post.find(
            (searchPattern !== undefined)
            ? { content: new RegExp(searchPattern) }
            : {}
        ).populate({
            path: 'user',
            select: 'nickname photo'
        }).populate({
            path: 'comments',
            select: 'content user createdAt -post'
        }).sort(
            { createdAt: (isTimeSortAscending ? 1 : -1) }
        );

        respondSuccess(res, 200, posts);
    },

    async createPost (req, res, next) {
        req.body.user = req.authenticatedUser.id;
        req.body.likes = [];
    
        //
        const newPost = await Post.create(req.body);
        respondSuccess(res, 201, newPost);
    },

    async deletePost (req, res, next) {
        const result = await Post.findByIdAndDelete(req.params.id);
        if (result === null) {
            throw operationalError(400, '找不到指定 ID 的貼文');
        }
        respondSuccess(res, 200, result);
    },

    async deleteAllPosts (req, res, next) {
        const result = await Post.deleteMany({});
        respondSuccess(res, 200, result);
    },
 
    async updatePost (req, res, next) {
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

    async createComment (req, res, next) {
        if (req.authenticatedUser === undefined) {
            throw new Error('authenticated user not found');
        }

        const post = await Post.findById(req.params.id);
        if (post === null) {
            throw operationalError(400, '貼文不存在');
        }

        const newComment = await Comment.create({
            'content': req.body.content,
            'post': req.params.id,
            'user': req.authenticatedUser.id
        });
        respondSuccess(res, 201, newComment);
    },
};
