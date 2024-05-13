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
        if (req.body.user !== undefined) {
            // 檢查 user 存在
            const user = await User.findById(req.body.user);
            if (user === null) {
                throw operationalError(400, 'user 不存在');
            }
        } else {
            // set a default user that exists in DB
            req.body.user = '663adeb90720cbbe100af83e';
        }
    
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

};
