const Comment = require('../model/comments');
const Post = require('../model/posts');
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
        
        const result = [];
        for (let i = 0; i < posts.length; ++i) {
            const doc =  posts[i].toObject();
            delete doc.likes;
            result.push(doc);
        }

        respondSuccess(res, 200, result);
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

    async addLike (req, res, next) {
        const postId = req.params.id;

        const result = await Post.updateOne(
            {
                _id: postId,
                'likes.user': { $ne: req.authenticatedUser.id }
            },
            {
                $push: {
                    likes: { user: req.authenticatedUser.id }
                }    
            }
        );

        if (result.matchedCount === 0) {
            // 兩種可能：(1) postId 不存在 (2) postId 的 `likes` 已經包含該使用者

            const post = await Post.findById(postId);
            if (post === null) {
                // postId 不存在
                throw operationalError(400, '貼文不存在');
            }
        }

        respondSuccess(res, 200);
    },

    async cancelLike (req, res, next) {
        const postId = req.params.id;
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $pull: {
                    likes: { user: req.authenticatedUser.id }
                }
            }
        );
        if (post === null) {
            throw operationalError(400, '貼文不存在');
        }

        respondSuccess(res, 200);
    }
};
