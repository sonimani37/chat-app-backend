var express = require("express");

const helper = require('../../helper/fileUpload');

var authRouter = express.Router();

const authController = require("../../controllers/authController");

authRouter.post("/signup",helper.upload.any(),authController.register);

authRouter.post("/signin", authController.login);

authRouter.get("/getUsers", authController.getUsers);

authRouter.post("/updateProfile/:userId", authController.updateProfile);


module.exports = authRouter;
