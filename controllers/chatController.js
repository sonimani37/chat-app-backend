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
            console.log('req.files ====',req.files);
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
                    if(!req.body?.message){
                        await Chat.update( { message: singleChat.filePath }, { where: { id: chat.id } }, );
                    }
                });
            }

            // // Retrieve the recipient's FCM token from the user model
            // let recipient = await User.findOne({
            //     where: { id: req.body.receiverId },
            //     include: [
            //         {
            //             model: UserImage,
            //             as: 'UserImages',
            //         },
            //     ],
            // });

            // recipient = recipient?.dataValues;
            // const baseUrl = req.protocol + '://' + req.get('host') + "/";
            // const originUrl = req.get('origin') || req.get('referer') || req.get('host');
            // if (recipient && recipient.fcmtoken) {
            //     const notificationPayload = {
            //         notification: {
            //             title: recipient.firstname + " " + recipient.lastname,
            //             body: req.body.message,
            //             image: baseUrl + recipient.UserImages?.dataValues?.filePath + "?width=100px&height=100px",
            //             icon: originUrl +'/assets/img/favicon.png',
            //             click_action: baseUrl,
            //         },
            //         data: {
            //             // add any additional data you want to send with the notification
            //         },
            //     };
            // sendPushNotification(recipient.fcmtoken, notificationPayload);
            // } else {
            //     console.log({ error: 'Recipient not found or missing FCM token' });
            // }
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
            console.log('id',id);
            chatData = await Chat.findOne({ where: { id } });

            if (!chatData) {
                return resp.status(404).json({ error: 'User not found' });
            }
            console.log("chatData", chatData);
            const todayDate = new Date();

            console.log(todayDate);

            await chatData.update({ isDeleted: todayDate });

            resp.status(200).json({ success: true, messages: chatData, });
        } catch (error) {
            return resp.status(500).json({ success: false, error: error.message })
        }
    }
}
