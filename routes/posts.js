const express = require("express");
const router = express.Router();

const { errorHandled } = require("../services/errorHandling");
const controllers = require("../controllers/posts");

router.get("/", errorHandled(controllers.getPosts));
router.delete("/", errorHandled(controllers.deleteAllPosts));

module.exports = router;
