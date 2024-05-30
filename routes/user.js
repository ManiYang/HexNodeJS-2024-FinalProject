const express = require('express');
const router = express.Router();

const { errorHandled } = require('../services/errorHandling');
const controllers = require('../controllers/users');
const {
    handleRequestBodyForUser,
    authenticateUser,
} = require('../middlewares');

router.get('/profile', authenticateUser, errorHandled(controllers.getProfile));

router.post(
    '/sign_up',
    handleRequestBodyForUser,
    errorHandled(controllers.signUp)
);

router.post(
    '/sign_in',
    handleRequestBodyForUser,
    errorHandled(controllers.signIn)
);

router.post(
    '/updatePassword',
    authenticateUser,
    errorHandled(controllers.updatePassword)
);

// router.patch('/:id', errorHandled(controllers.updateUser));

router.patch(
    '/profile',
    authenticateUser,
    handleRequestBodyForUser,
    errorHandled(controllers.updateProfile)
);

//
module.exports = router;
