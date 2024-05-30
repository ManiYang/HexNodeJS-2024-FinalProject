const express = require("express");
const router = express.Router();

const { handleRequestBodyForPost, authenticateUser } = require("../middlewares");
const { errorHandled } = require("../services/errorHandling");
const controllers = require("../controllers/posts");

router.post(
    "/",
    errorHandled(authenticateUser),
    handleRequestBodyForPost,
    errorHandled(controllers.createPost)
);

router.delete(
    "/:id", 
    errorHandled(authenticateUser),
    errorHandled(controllers.deletePost)
);

router.patch(
    "/:id",
    errorHandled(authenticateUser),
    handleRequestBodyForPost,
    errorHandled(controllers.updatePost)
);

module.exports = router;
