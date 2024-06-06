const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../middlewares');
const { errorHandled } = require('../services/errorHandling');
const controllers = require('../controllers/posts');

router.get(
    '/', 
    errorHandled(authenticateUser), 
    errorHandled(controllers.getPosts)
);

router.get(
    '/user/:userId',
    errorHandled(authenticateUser), 
    errorHandled(controllers.getPostsByUser)
); // 可取得他人的貼文列表

router.delete(
    '/', 
    errorHandled(authenticateUser), 
    errorHandled(controllers.deleteAllPosts)
);

module.exports = router;
