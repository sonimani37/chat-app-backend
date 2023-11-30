var express = require("express");

var authRouter = express.Router();

const authController = require("../../controllers/authController");

authRouter.post("/signup", authController.register);

authRouter.post("/signin", authController.login);

authRouter.get("/getUsers", authController.getUsers);


module.exports = authRouter;
