const { Chat } = require('../models');
const { User } = require('../models');
const { SingleChatMedia } = require('../models');

const { Op } = require('sequelize'); // Import the Op (Operator) module

module.exports = {
    async sendMessage(req, resp) {
        if (!req.body.senderId) {
            return resp.status(400).json({ message: 'Sender ID is required' });
        }
        if (!req.body.receiverId) {
            return resp.status(400).json({ message: 'Receiver ID is required' });
        }
        try {
            req.body.senderId = JSON.parse(req.body.senderId);
            req.body.receiverId = JSON.parse(req.body.receiverId);

            var chat = await Chat.create(
                {
                    message: req.body?.message,
                    senderId: req.body.senderId,
                    receiverId: req.body.receiverId,
                }
            );
            var mediaId = chat.id;
            if (req.files) {
                req.files.forEach(async element => {
                    const singleChat = await SingleChatMedia.create(
                        {
                            singleChatId: mediaId,
                            fileType: element.mimetype,
                            fileName: element.filename,
                            filePath: element.path
                        }
                    );
                    
                    await Chat.update(
                        { message: singleChat.filePath },
                        { where: { id: chat.id } },
                    );
                });
            }

            return resp.status(200).json({ success: true, successmessage: 'send message successfully' });
        } catch (error) {
            return resp.status(500).json({ success: false, error: error.message })
        }
    },

    async getMessages(req, resp) {
        try {
            var sender_id = JSON.parse(req.body.senderId);
            var receiver_id = JSON.parse(req.body.receiverId);
            const chat = await Chat.findAll({
                where: {
                    [Op.or]: [
                        { senderId: sender_id, receiverId: receiver_id },
                        { senderId: receiver_id, receiverId: sender_id },
                    ],
                },
                include: [
                    { model: User, as: 'sender' },
                    { model: User, as: 'receiver' },
                ],
                order: [['createdAt', 'ASC']], // You can adjust the order as needed
            });

            resp.status(200).json({ success: true, messages: chat, });
        } catch (error) {
            return resp.status(500).json({ success: false, error: error.message })
        }
    },
}