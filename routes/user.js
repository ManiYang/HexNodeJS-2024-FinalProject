const express = require("express");
const router = express.Router();

const { errorHandled } = require("../services/errorHandling");
const controllers = require("../controllers/users");
const { handleRequestBodyForUser } = require("../middlewares");

router.get("/:id", errorHandled(controllers.getUser));

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

router.patch("/:id", errorHandled(controllers.updateUser));

//
module.exports = router;
