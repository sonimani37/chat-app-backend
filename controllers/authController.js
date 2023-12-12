const { User } = require('../models');
const { UserImage } = require('../models');
const { Op, where } = require('sequelize'); // Import the Op (Operator) module
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


module.exports = {
    async register(req, resp) {
        // var user_image;
        console.log('req.body', req.body);
        console.log('req.files', req.files);

        if (!req.body.firstname || !req.body.lastname || !req.body.contact || !req.body.email || !req.body.password) {
            // return resp.status(400).json({ message: 'All fields are required' });
            if (!req.body.firstname) {
                return resp.status(400).json({ message: 'First name is required' });
            } else if (!req.body.lastname) {
                return resp.status(400).json({ message: 'Last name is required' });
            } else if (!req.body.contact) {
                return resp.status(400).json({ message: 'Contact is required' });
            } else if (!req.body.email) {
                return resp.status(400).json({ message: 'Email is required' });
            } else if (!req.body.password) {
                return resp.status(400).json({ message: 'Password is required' });
            }
        }
        try {
            // Check if the contact is already in use
            const existingContact = await User.findOne({ where: { contact: req.body.contact } });
            if (existingContact !== null) {
                return resp.status(400).json({ message: 'Contact is already in use' });
            }
            console.log('existingContact', existingContact);

            const existingEmail = await User.findOne({ where: { email: req.body.email } });
            if (existingEmail !== null) {
                return resp.status(400).json({ message: 'Email is already in use' });
            }

            // console.log('existingEmail',existingEmail);

            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            console.log('hashedPassword', hashedPassword);

            const user = await User.create(
                {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    contact: req.body.contact,
                    email: req.body.email,
                    password: hashedPassword
                }
            );
            let user_image;
            if (req.files && req.files.length > 0) {
                user_image = await UserImage.create(
                    {
                        userId: user.id,
                        fileType: req.files[0].mimetype,
                        fileName: req.files[0].originalname,
                        filePath: req.files[0].path
                    }
                );
                console.log('user_image', user_image);
                console.log('user_image', user_image.fileName);
            }

            const userData = {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                contact: user.contact,
                userImage: user_image ? user_image.fileName : null,
            }

            console.log('userData', userData);
            // // Create JWT token
            const token = jwt.sign({ userInfo: userData }, 'chat-app', { expiresIn: '1h' });
            return resp.status(200).json({ success: true, user: user, successmessage: 'Registered successfully' });
        } catch (error) {
            // return resp.send(error)
            return resp.status(500).json({ success: false, message: error.message })
        }
    },

    async login(req, resp) {

        if (!req.body.email || !req.body.password) {
            if (!req.body.email) {
                return resp.status(400).json({ message: 'Email is required' });
            }
            if (!req.body.password) {
                return resp.status(400).json({ message: 'Password is required' });
            }
        }
        try {
            const { email, password } = req.body;

            const user = await User.findOne({
                where: { email },
                include: [{
                    model: UserImage,
                    required: true, // INNER JOIN equivalent
                    association: 'UserImages',
                    // on: {
                    //   userId: Sequelize.col('Users.id') // ON ui.userId = Users.id
                    // }
                }]
            });

            if (!user) {
                return resp.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return resp.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            if (user) {
                await user.update({ status: 'online' });
            }

            const userData = {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                contact: user.contact,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                userImage: user?.UserImages,
                status: user.status
            }
            // Create JWT token
            const token = jwt.sign({ userInfo: userData }, 'chat-app', { expiresIn: '1h' });

            resp.status(200).json({ success: true, user: userData, token: token, successmessage: 'Login successfully' });
        } catch (error) {
            console.error(error);
            resp.status(500).json({ success: false, error: error });
        }
    },


    async getUsers(req, res) {
        try {
            var user;
            if (req.query.id) {
                const id = req.query.id;
                // user = await User.findOne({ where: { userId } });
                // user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
                user = await User.findOne({
                    where: { id },
                    attributes: { exclude: ['password'] },
                    include: [{
                        model: UserImage,
                        required: true, // INNER JOIN equivalent
                        association: 'UserImages',
                    }]
                });
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
            } else {
                user = await User.findAll({
                    attributes: { exclude: ['password'] },
                    include: [{
                        model: UserImage,
                        required: true, // INNER JOIN equivalent
                        association: 'UserImages',
                    }]
                });
            }
            console.log('--------user-----', user);
            res.status(200).json({ success: true, user: user, });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    },

    async updateProfile(req, resp) {
        try {
            let profileId = req.params.userId;
            let updatedData = req.body;
            console.log('------profileId------', profileId);
            console.log('------req.body------', req.body);
            console.log('------req.files------', req.files);
            const profile = await User.findByPk(profileId);
            if (!profile) {
                throw new Error('Profile not found');
            }
            console.log('profile', profile);
            // let user_image;
            // if (req.files && req.files.length > 0) {
            //      user_image = await UserImage.create(
            //         {
            //             userId: profile.id,
            //             fileType: req.files[0].mimetype,
            //             fileName: req.files[0].originalname,
            //             filePath: req.files[0].path
            //         }
            //     );
            //     console.log('user_image',user_image);
            //     console.log('user_image',user_image.fileName);
            // }

            // let newData = await profile.update(updatedData);
            // return resp.status(200).json({ success: true, user: newData, successmessage: 'Profile updated successfully' });
            return resp.status(200).json({ success: true, successmessage: 'Profile updated successfully' });
        } catch (error) {
            resp.status(500).json({ success: false, error: error.message });
        }
    },

    async logOut(req, resp) {
        console.log('request.params.userId', req.params);
        try {
            const id = req.params.userId;
            const status = await User.findByPk(id);

            await status.update({ status: 'offline' });
            // const status = await User.update(
            //     { status: 'offline' },
            //     { where : id },
            //     );

            return resp.status(200).json({ success: true });
        } catch (error) {
            resp.status(500).json({ success: false, error: error.message });
        }
    },
    async loginWithContact(req, resp) {

        try {
            const { contact } = req.body;
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            let user;

            const existingContact = await User.findOne({ where: { contact: req.body.contact } });

            if (existingContact !== null) {
                user = await existingContact.update({ otp: otp });
            } else {
                user = await User.create({ contact, otp });
            }

            if (user) {
                sendOTP(contact, otp);
                resp.json({ success: true, message: 'User registered successfully' });
            } else {
                resp.status(500).json({ success: false, message: 'Failed to register user' });
            }

        } catch (error) {
            console.error(error);
            resp.status(500).json({ success: false, error: error });
        }
    },

    async varifyUser(req, resp) {
        try {
            const { contact, otp } = req.body;
            const user = await User.findOne({ where: { contact, otp } });
            if (user) {
                resp.json({ success: true, message: 'OTP verified successfully' })
            } else {
                resp.status(400).json({ success: false, message: 'Invalid OTP' });
            }

        } catch (error) {
            console.error(error);
            resp.status(500).json({ success: false, error: error });
        }
    },
}

const accountSid = 'AC0dcce2b47137f3278d7ec2def1ad76e5';
const authToken = '938249577eff1220fdae184e137d5385';
const client = require('twilio')(accountSid, authToken);

const sendOTP = async (phoneNumber, otp) => {
    try {
        const message = await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: '+12056712773',
            to: phoneNumber,
        });

        return ({ success: true, message: 'successfully send varification code', id: message.sid });
        //   return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};