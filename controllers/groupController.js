const { Chat } = require('../models');
const { User } = require('../models');
const { Groups } = require('../models');
const { GroupUsers } = require('../models');
const { GroupChat } = require('../models');
const { GroupChatMedia } = require('../models');


const { Op } = require('sequelize'); // Import the Op (Operator) module

module.exports = {

    async createGroup(req, resp) {
        try {
            const { group_name, users } = req.body;
            // Create group
            const group = await Groups.create({ group_name });
            // Add users to the group
            await Promise.all(users.map(userId => GroupUsers.create({ group_id: group.id, user_id: userId })));
            resp.status(200).json({ success: true, successmessage: 'Group created successfully' });
        } catch (error) {
            resp.status(500).json({ success: false, error: error.message });
        }
    },


    async getGroups(req, resp) {
        try {
            if (req.query.id) {
                const groupId = req.query.id;
                // Get group details and participants
                const group = await Groups.findByPk(groupId, { include: 'user' });
                if (!group) {
                    return resp.status(404).json({ message: 'Group not found' });
                }
                resp.status(200).json({ success: true, group: group });
            } else {
                const groups = await Groups.findAll(
                    { include: 'user', }
                );
                resp.status(200).json({ success: true, groups: groups });
            }
        } catch (error) {
            resp.status(500).json({ success: false, error: error.message });
        }
    },

    async sendMessage(req, resp) {
        if (!req.body.senderId) {
            return resp.status(400).json({ message: 'Sender ID is required' });
        }
        if (!req.body.groupId) {
            return resp.status(400).json({ message: 'group ID is required' });
        }
        try {
            console.log(req.body);
            req.body.senderId = JSON.parse(req.body.senderId);
            req.body.groupId = JSON.parse(req.body.groupId);
            const groupChat = await GroupChat.create(
                {
                    message: req.body?.message,
                    groupId: req.body.groupId,
                    senderId: req.body.senderId,
                });
                var mediaId = groupChat.id;
                if(req.files){
                    req.files.forEach(async element => {
                     var gpChat =  await GroupChatMedia.create(
                            {
                                groupChatId: mediaId,
                                fileType: element.mimetype,
                                fileName: element.filename,
                                filePath: element.path
                            }
                        );

                        await GroupChat.update(
                            { message: gpChat.filePath },
                            { where: { id: groupChat.id } },
                        );
                    });
                }
            
            return resp.status(200).json({ success: true, successmessage: 'send message successfully' });
        } catch (error) {
            console.log(error);
            return resp.status(500).json({ success: false, error: error.message })
        }
    },

    async getGroupMessages(req, resp) {
        try {
            var groupId = JSON.parse(req.body.groupId);
            const groupChat = await GroupChat.findAll({
                where: { groupId },
                include: [
                    { model: User, as: 'sender' },
                    { model: Groups, as: 'group' },
                ],
             });

            resp.status(200).json({ success: true, messages: groupChat, });
        } catch (error) {
            return resp.status(500).json({ success: false, error: error.message });
        }
    },

}
