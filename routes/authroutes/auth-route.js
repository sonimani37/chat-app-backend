var express = require("express");

var authRouter = express.Router();

const authController = require("../../controllers/authController");


console.log('auth-route');

authRouter.post("/register", authController.register);

authRouter.post("/login", authController.login);

authRouter.get("/getUsers", authController.getUsers);


module.exports = authRouter;
