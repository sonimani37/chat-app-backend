var express = require("express");

var chatRoutes = express.Router();

const chatController = require("../../controllers/chatController");

chatRoutes.post("/send-message", chatController.sendMessage);

chatRoutes.post("/get-messages", chatController.getMessages);


module.exports = chatRoutes;
