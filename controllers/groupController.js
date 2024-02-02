const { User, Groups, GroupUsers, GroupChat, GroupChatMedia, UserImage } = require('../models');
const { Op } = require('sequelize'); // Import the Op (Operator) module

module.exports = {

    async createGroup(req, resp) {
        try {
            console.log(req.body);
            const { name, participants } = req.body;

            // Create the group
            const group = await Groups.create({
                group_name: name,
            });

            // Convert the participants string to an array of integers
            const users = participants.map(userId => parseInt(userId, 10));

            // Add users to the group
            await Promise.all(users.map(userId => GroupUsers.create({ group_id: group.id, user_id: userId })));

            resp.status(200).json({ success: true, successmessage: 'Group created successfully' });
        } catch (error) {
            resp.status(500).json({ success: false, error: error.message });
        }
    },

    async updateGroup(req, resp) {
        try {

            let groupId = req.params.groupId;
            const groupById = await Groups.findByPk(groupId);
            if (!groupById) {
                throw new Error('Group not found');
            }

            // Update group_name
            const { group_name } = req.body;
            groupById.group_name = group_name;

            // Update file
            if (req.files && req.files.length > 0) {
                const element = req.files[0]; // Assuming only one file is updated
                groupById.fileType = element.mimetype;
                groupById.fileName = element.filename;
                groupById.filePath = element.path;
            }

            await groupById.save();

            if (req.body.users) {
                // Update group users
                const users = req.body.users.split(',').map(userId => parseInt(userId, 10));

                // Delete old group users
                await GroupUsers.destroy({ where: { group_id: groupId } });

                // Add updated users to the group
                await Promise.all(users.map(userId => GroupUsers.create({ group_id: groupId, user_id: userId })));
            }

            resp.status(200).json({ success: true, successmessage: 'Group updated successfully' });
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
            if (req.files) {
                req.files.forEach(async element => {
                    var gpChat = await GroupChatMedia.create(
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
                    // { model: User, as: 'sender' },
                    {
                        model: User,
                        as: 'sender',
                        include: [
                            { model: UserImage, as: 'UserImages' }
                        ],
                    },
                    { model: Groups, as: 'group' },
                ],
                order: [['createdAt', 'ASC']],
            });

            resp.status(200).json({ success: true, messages: groupChat, });
        } catch (error) {
            return resp.status(500).json({ success: false, error: error.message });
        }
    },

    async deleteChat(req, resp) {
        try {
            var id = req.params.id;
            console.log('id', id);

            var groupChatData = await GroupChat.findOne({ where: { id } });

            if (!groupChatData) {
                return resp.status(404).json({ error: 'groupChat not found' });
            }
            console.log("groupChatData", groupChatData);
            const todayDate = new Date();
            console.log(todayDate);

           let result =  await groupChatData.update({ isDeleted: todayDate });
            console.log(result);
            
            resp.status(200).json({ success: true, messages: groupChatData, });
        } catch (error) {
            return resp.status(500).json({ success: false, error: error.message })
        }
    },

}
