const express = require("express");
const router = express.Router();

const { authenticateUser, checkUploadImage } = require("../middlewares");
const { errorHandled } = require("../services/errorHandling");
const controllers = require("../controllers/upload");

router.post(
    "/image",
    errorHandled(authenticateUser),
    errorHandled(checkUploadImage),
    errorHandled(controllers.uploadImage)
);

module.exports = router;
