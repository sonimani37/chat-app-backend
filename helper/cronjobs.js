const cron = require('node-cron');
const { PushNotification } = require('../models');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

//for sending push notifications
const runCronJob = () => {
    cron.schedule('* * * * *', async (req) => {
        try {
            const filePath = path.join(__dirname, '../json/fcmToken.json');
            const data = fs.readFileSync(filePath, 'utf-8');
            
            const unsentNotifications = await PushNotification.findAll({
                where: {
                    isSent: null,
                },
            });

            unsentNotifications.forEach(async (notification) => {
                // send push notifications
                sendFcmNotification(data, notification.body);

                // Update the isSent flag after sending the notification
                await notification.update({ isSent: true });
            });
        } catch (error) {
            console.error('Error in cron job:', error.message);
        }
    });
};



function sendFcmNotification(to, data) {
    console.log(to);
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

module.exports = runCronJob;