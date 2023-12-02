const { Chat } = require('../models');
const { User } = require('../models');
const { Op } = require('sequelize'); // Import the Op (Operator) module

module.exports = {
    async sendMessage(req, resp) {
        try {
            req.body.senderId = JSON.parse(req.body.senderId);
            req.body.receiverId = JSON.parse(req.body.receiverId);
            const chat = await Chat.create(
                {
                    message: req.body.message,
                    senderId: req.body.senderId,
                    receiverId: req.body.receiverId,
                }
            );
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