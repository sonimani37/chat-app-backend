var express = require("express");

var chatRoutes = express.Router();

const chatController = require("../../controllers/chatController");

authRouter.post("/send-message", chatController.sendMessage);

authRouter.get("/get-message", chatController.getMessage);


module.exports = chatRoutes;
