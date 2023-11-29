const { Chat } = require('../models');
const { Op } = require('sequelize'); // Import the Op (Operator) module

module.exports = {
    async sendMessage(req, resp) {
        try {

        } catch (error) {
            // return resp.send(error)
            return resp.status(500).json({ success: false, message: error })
        }
    },

    async getMessage(req, resp) {
        try {
           
        } catch (error) {
            // return resp.send(error)
            return resp.status(500).json({ success: false, message: error })
        }
    },
}