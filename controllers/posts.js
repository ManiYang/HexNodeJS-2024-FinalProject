const Comment = require('../model/comments');
const Post = require('../model/posts');
const { operationalError } = require('../services/errorHandling');
const { respondSuccess } = require('../services/response');

/**
 * @param {object} args can have keys `isTimeSortAscending`, `textSearchPattern`, 
 *                      `postId`, `userId`
 * @returns a list of objects
 */
async function listPosts (args) {
    // build filter
    filter = {}
    if (args.textSearchPattern) {
        filter.content = new RegExp(args.textSearchPattern);
    }
    if (args.postId) {
        filter._id = args.postId;
    }
    if (args.userId) {
        filter.user = args.userId;
    }

    //
    const postDocs = await Post.find(
        filter
    ).populate({
        path: 'user',
        select: 'nickname photo'
    }).populate({
        path: 'comments',
        select: 'content user createdAt -post'
    }).sort(
        { createdAt: (Boolean(args.isTimeSortAscending) ? 1 : -1) }
    );
    
    // remove `likes` field
    const postObjs = [];
    for (let i = 0; i < postDocs.length; ++i) {
        const postObj = postDocs[i].toObject();
        delete postObj.likes;
        postObjs.push(postObj);
    }

    return postObjs;
}

//

module.exports = {
    async getPosts (req, res, next) {
        isTimeSortAscending = (req.query.timeSort === 'asc');
        textSearchPattern = req.query.q;

        const posts = await listPosts({ isTimeSortAscending, textSearchPattern });
        respondSuccess(res, 200, posts);
    },

    async getSinglePost (req, res, next) {
        const posts = await listPosts({ postId: req.params.id });
        if (posts.length === 0) {
            throw operationalError(400, '貼文不存在');
        }

        respondSuccess(res, 200, posts[0]);
    },

    async getPostsByUser (req, res, next) {
        const posts = await listPosts({ userId: req.params.userId });
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
            throw operationalError(400, '貼文不存在');
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
