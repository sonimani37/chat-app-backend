const { Chat } = require('../models');
const { UserImage } = require('../models');
const { User } = require('../models');
const { SingleChatMedia } = require('../models');
const sendPushNotification = require('./../pushNotifications');

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
            console.log('req.files ====', req.files);
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
                    // if(!req.body?.message){
                    //     await Chat.update( { message: singleChat.filePath }, { where: { id: chat.id } }, );
                    // }
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
                    isDeleted: null
                },
                include: [
                    { model: User, as: 'sender' },
                    { model: User, as: 'receiver' },
                    {
                        model: SingleChatMedia,
                        association: 'ChatMedia',
                    }
                ],
                order: [['createdAt', 'ASC']], // You can adjust the order as needed
            });

            resp.status(200).json({ success: true, messages: chat, });
        } catch (error) {
            return resp.status(500).json({ success: false, error: error.message })
        }
    },

    async deleteChat(req, resp) {
        try {
            var id = req.params.id;
            console.log('id', id);
            chatData = await Chat.findOne({ where: { id } });
            if (!chatData) {
                return resp.status(404).json({ error: 'User not found' });
            }
            const todayDate = new Date();
            await chatData.update({ isDeleted: todayDate });
            resp.status(200).json({ success: true, messages: chatData, });
        } catch (error) {
            return resp.status(500).json({ success: false, error: error.message })
        }
    },

    async startCall(req, res) {
        try {
            // Logic to start a call and save it to the database
            // Handle signaling and set up WebRTC connection on the server side
        } catch (error) {
            console.error('Error starting call:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
      
    async endCall(req, res) {
        try {
            // Logic to end a call and update the database
            // Close the WebRTC connection on the server side
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
      
}
