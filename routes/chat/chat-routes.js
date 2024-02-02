var express = require("express");

const helper = require('../../helper/fileUpload');

var chatRoutes = express.Router();

const chatController = require("../../controllers/chatController");

chatRoutes.post("/send-message",helper.upload.any(),chatController.sendMessage);

chatRoutes.post("/get-messages", chatController.getMessages);

chatRoutes.delete("/delete-message/:id", chatController.deleteChat);

chatRoutes.post('/start-call', chatController.startCall);

chatRoutes.post('/end-call', chatController.endCall);

module.exports = chatRoutes;
