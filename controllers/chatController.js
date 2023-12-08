const { Chat } = require('../models');
const { User } = require('../models');
const { SingleChatMedia } = require('../models');
const { PushNotification } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const axios = require('axios');


module.exports = {
    async sendMessage(req, resp) {
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

            await PushNotification.create({
                title: "New Message",
                body: req.body?.message,
                userId: req.body.receiverId
            })

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

            if (req.body.fcmToken) {
                // const filePath = path.join(__dirname, '../json/fcmToken.json');
                // fs.writeFile(filePath, JSON.stringify(req.body.fcmToken, null, 2),'utf-8',()=>{});
                sendFcmNotification(req.body.fcmToken, req.body?.message)
            }

            return resp.status(200).json({ success: true, successmessage: 'send message successfully' });
        } catch (error) {
            console.log(error);
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

const sendFcmNotification = (to, data) => {
    var serverKey = "AAAAXsbf_kc:APA91bHD0A3mTIQfk_w_kEeZlrNJ8w9VdMJ92Q3aa1TGjC5zHxoyrtqjD0jENO0MdDEv3-EBZUz9Nq9dutB3c80-2LXD0P-_F1PuOlNwAOUrTbXjEAzDKcwAfnF3V2WtnmxMAyM0SXuq";

    const headers = {
        'Authorization': `key=${serverKey}`,
        'Content-Type': 'application/json'
    };

    const notificationData = {
        notification: {
            title: 'New Message',
            body: data,
            icon: '../assets/731657547631815CRISTIANORONALDOMenSetOf2CR7GameOnEaudeToiletteCR7BodySprayC1.jpg',
            image: '../assets/1671012101618-PERFUMERS-CLUB-Women-Set-of-7-Complete-Fragrance-Eau-De-Parf-5.jpg',
            vibrate: [200, 100, 200],
        },
        to: to
    };

    axios.post('https://fcm.googleapis.com/fcm/send', notificationData, { headers })
        .then(response => {
            console.log('Notification sent successfully:', response.data);
        })
        .catch(error => {
            console.error('Error sending notification:', error.message);
        });
}