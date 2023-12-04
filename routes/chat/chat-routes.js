var express = require("express");

const helper = require('../../helper/fileUpload');

var chatRoutes = express.Router();

const chatController = require("../../controllers/chatController");

chatRoutes.post("/send-message",helper.upload.any(),chatController.sendMessage);

chatRoutes.post("/get-messages", chatController.getMessages);

module.exports = chatRoutes;
