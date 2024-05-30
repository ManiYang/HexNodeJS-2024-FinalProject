const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middlewares");
const { errorHandled } = require("../services/errorHandling");
const controllers = require("../controllers/users");

router.get(
    "/", 
    errorHandled(authenticateUser), 
    errorHandled(controllers.getUsers)
);

module.exports = router;
