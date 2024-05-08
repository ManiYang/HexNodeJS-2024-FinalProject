var express = require('express');
var router = express.Router();

const Post = require('../model/posts');
const User = require('../model/users');
const { handleRequestBodyForPost } = require('../middlewares')

router.get('/', async (req, res, next) => {
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
        { createAt: (isTimeSortAscending ? 1 : -1)}
    );

    res.status(200).json({
        status: 'success',
        data: posts
    });
});

router.post('/', handleRequestBodyForPost, async (req, res, next) => {
    try {
        if (req.body.user !== undefined) {
            // 檢查 user 存在
            const user = await User.findById(req.body.user);
            if (user === null) {
                throw new Error('user 不存在');
            }
        }

        req.body.likes = [];

        //
        const newPost = await Post.create(req.body);
        res.status(200).json({
            status: 'success',
            data: newPost
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        });
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const result = await Post.findByIdAndDelete(req.params.id);
        if (result === null) {
            throw new Error('找不到指定 ID 的貼文');
        }
        res.status(200).json({
            status: 'success',
            data: result
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        });
    }
});

module.exports = router;

