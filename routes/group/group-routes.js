var express = require("express");

const helper = require('../../helper/fileUpload');

var groupRoutes = express.Router();

const groupController = require("../../controllers/groupController");

groupRoutes.post("/create",helper.upload.any(), groupController.createGroup);

groupRoutes.post("/update/:groupId",helper.upload.any(), groupController.updateGroup);

groupRoutes.get("/", groupController.getGroups);

groupRoutes.post("/send-message",helper.upload.any(),groupController.sendMessage);

groupRoutes.post("/get-messages", groupController.getGroupMessages);

groupRoutes.delete("/delete-message/:id", groupController.deleteChat);


module.exports = groupRoutes;