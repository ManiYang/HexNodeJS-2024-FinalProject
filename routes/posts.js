const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middlewares");
const { errorHandled } = require("../services/errorHandling");
const controllers = require("../controllers/posts");

router.get(
    "/", 
    errorHandled(authenticateUser), 
    errorHandled(controllers.getPosts)
);

router.delete(
    "/", 
    errorHandled(authenticateUser), 
    errorHandled(controllers.deleteAllPosts)
);

module.exports = router;
