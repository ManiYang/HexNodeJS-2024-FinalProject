const express = require("express");
const router = express.Router();

const { errorHandled } = require("../services/errorHandling");
const controllers = require("../controllers/users");
const { handleRequestBodyForUser, authenticateUser } = require("../middlewares");

router.get(
    "/profile",
    errorHandled(authenticateUser),
    errorHandled(controllers.getProfile)
);

router.post(
    "/sign_up",
    handleRequestBodyForUser,
    errorHandled(controllers.signUp)
);

router.post(
    "/sign_in",
    handleRequestBodyForUser,
    errorHandled(controllers.signIn)
);

router.patch(
    "/updatePassword",
    errorHandled(authenticateUser),
    errorHandled(controllers.updatePassword)
);

router.patch(
    "/profile",
    errorHandled(authenticateUser),
    handleRequestBodyForUser,
    errorHandled(controllers.updateProfile)
);

//
module.exports = router;
