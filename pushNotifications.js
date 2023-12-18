// pushNotifications.js
const admin = require('./firebaseAdmin'); // adjust the path accordingly

const sendPushNotification = (deviceToken, payload) => {
  admin.messaging().sendToDevice(deviceToken, payload)
    .then(response => {
      console.log('Successfully sent message:', response);
    })
    .catch(error => {
      console.error('Error sending message:', error);
    });
};

module.exports = sendPushNotification;
