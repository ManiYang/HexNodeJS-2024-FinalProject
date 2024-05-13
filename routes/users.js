var express = require('express');
var router = express.Router();

const errorHandled = require('../services/handleAsyncError')
const controllers = require('../controllers/users')

router.get('/', errorHandled(controllers.getUsers));
router.get('/:id', errorHandled(controllers.getUser));
router.post('/', errorHandled(controllers.createUser));
router.patch('/:id', errorHandled(controllers.updateUser));

module.exports = router;
