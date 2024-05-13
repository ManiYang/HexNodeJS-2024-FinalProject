var express = require('express');
var router = express.Router();

const { handleRequestBodyForPost } = require('../middlewares')
const errorHandled = require('../services/handleAsyncError')
const controllers = require('../controllers/posts')

router.get('/', errorHandled(controllers.getPosts));
router.post('/', handleRequestBodyForPost, errorHandled(controllers.createPost));
router.delete('/:id', errorHandled(controllers.deletePost));

module.exports = router;
