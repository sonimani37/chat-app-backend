var express = require("express");

const helper = require('../../helper/fileUpload');

var groupRoutes = express.Router();

const groupController = require("../../controllers/groupController");

groupRoutes.post("/create", groupController.createGroup);

groupRoutes.get("/", groupController.getGroups);

groupRoutes.post("/send-message",helper.upload.any(),groupController.sendMessage);

groupRoutes.post("/get-messages", groupController.getGroupMessages);


module.exports = groupRoutes;