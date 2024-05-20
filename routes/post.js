const express = require("express");
const router = express.Router();

const { handleRequestBodyForPost } = require("../middlewares");
const { errorHandled } = require("../services/errorHandling");
const controllers = require("../controllers/posts");

router.post(
    "/",
    handleRequestBodyForPost,
    errorHandled(controllers.createPost)
);
router.delete("/:id", errorHandled(controllers.deletePost));
router.patch(
    "/:id",
    handleRequestBodyForPost,
    errorHandled(controllers.updatePost)
);

module.exports = router;
