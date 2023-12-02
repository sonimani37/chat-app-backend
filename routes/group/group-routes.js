var express = require("express");

var groupRoutes = express.Router();

const groupController = require("../../controllers/groupController");

groupRoutes.post("/create", groupController.createGroup);

groupRoutes.get("/", groupController.getGroups);

groupRoutes.post("/send-message", groupController.sendMessage);

groupRoutes.post("/get-messages", groupController.getGroupMessages);


module.exports = groupRoutes;