const { User } = require('../models');
const { Op } = require('sequelize'); // Import the Op (Operator) module
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


module.exports = {
    async register(req, resp) {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = await User.create(
                {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    contact: req.body.contact,
                    email: req.body.email,
                    password: hashedPassword
                }
            );
            const userData = {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                contact: user.contact,
            }
            // // Create JWT token
            const token = jwt.sign({ userInfo: userData }, 'chat-app', { expiresIn: '1h' });
            return resp.status(200).json({ success: true, user: user, successmessage: 'Registered successfully' });
        } catch (error) {
            // return resp.send(error)
            return resp.status(500).json({ success: false, message: error })
        }
    },

    async login(req, resp) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return resp.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return resp.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            const userData = {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                contact: user.contact,
            }
            // Create JWT token
            const token = jwt.sign({ userInfo: userData }, 'chat-app', { expiresIn: '1h' });

            resp.status(200).json({ success: true, user: user, token: token, successmessage: 'Login successfully' });
        } catch (error) {
            console.error(error);
            resp.status(500).json({ success: false, error: error });
        }
    },


    async getUsers(req, res) {
        try {
            var user;
            if (req.query.id) {
                const userId = req.query.id;
                // user = await User.findOne({ where: { userId } });
                user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
            } else {
                user = await User.findAll({ attributes: { exclude: ['password'] } });
            }
            res.status(200).json({ success: true, user: user, });
        } catch (error) {
            console.error(error);
            res.status(500).json({  success: false,error: 'Internal Server Error' });
        }
    },
}