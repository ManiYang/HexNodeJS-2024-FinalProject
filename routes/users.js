const express = require("express");
const router = express.Router();

const { errorHandled } = require("../services/errorHandling");
const controllers = require("../controllers/users");

router.get("/", errorHandled(controllers.getUsers));
router.get("/:id", errorHandled(controllers.getUser));
router.post("/", errorHandled(controllers.createUser));
router.patch("/:id", errorHandled(controllers.updateUser));

module.exports = router;
