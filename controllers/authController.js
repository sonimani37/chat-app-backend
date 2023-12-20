const { User } = require('../models');
const { UserImage } = require('../models');
require('sequelize'); // Import the Op (Operator) module
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

module.exports = {
    async register(req, resp) {
        try {
            const { firstname, lastname, contact, email, password } = req.body;

            const requiredFields = ['firstname', 'lastname', 'contact', 'email', 'password'];
            const missingFields = requiredFields.filter(field => !req.body[field]);

            if (missingFields.length > 0) {
                const errorMessage = `Following fields are required: ${missingFields.join(', ')}`;
                return resp.status(400).json({ message: errorMessage });
            }

            const existingContact = await User.findOne({ where: { contact } });
            if (existingContact) {
                return resp.status(400).json({ message: 'Contact is already in use' });
            }

            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                return resp.status(400).json({ message: 'Email is already in use' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                firstname,
                lastname,
                contact,
                email,
                password: hashedPassword,
            });

            let userImage;
            if (req.files && req.files.length > 0) {
                userImage = await UserImage.create({
                    userId: user.id,
                    fileType: req.files[0].mimetype,
                    fileName: req.files[0].originalname,
                    filePath: req.files[0].path,
                });
            }

            const userData = {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                contact: user.contact,
                userImage: userImage ? userImage.fileName : null,
            };

            return resp.status(200).json({ success: true, user: userData, successmessage: 'Registered successfully' });
        } catch (error) {
            console.error(error);
            return resp.status(500).json({ success: false, message: error.message });
        }
    },

    async login(req, resp) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return resp.status(400).json({ message: 'Email and password are required' });
            }

            let user = await User.findOne({
                where: { email },
                include: [
                    {
                        model: UserImage,
                        as: 'UserImages',
                    },
                ],
            });

            if (!user) {
                return resp.status(401).json({ success: false, error: 'User not found' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return resp.status(401).json({ success: false, error: 'Invalid password' });
            }

            await user.update({ status: 'online' });
            const userData = {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                contact: user.contact,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                UserImages: user?.dataValues?.UserImages?.dataValues,
                status: user.status,
            };

            // Create JWT token
            const token = jwt.sign({ userInfo: userData }, 'chat-app', { expiresIn: '1h' });

            resp.status(200).json({ success: true, user: userData, token, successmessage: 'Login successfully' });
        } catch (error) {
            console.error(error);
            resp.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    },

    async getUsers(req, res) {
        try {
            var user;
            if (req.query.id) {
                const id = req.query.id;
                user = await User.findOne({
                    where: { id },
                    attributes: { exclude: ['password'] },
                    include: [{
                        model: UserImage,
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
                        association: 'UserImages',
                    }]
                });
            }
            res.status(200).json({ success: true, user: user, });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    },

    async updateProfile(req, resp) {
        try {
            let user_image;

            if (req.files && req.files.length > 0) {
                user_image = await createOrUpdate(
                    {
                        userId: req.params.userId,
                        fileType: req.files[0].mimetype,
                        fileName: req.files[0].originalname,
                        filePath: req.files[0].path
                    },
                    { where: { userId: req.params.userId } },
                    UserImage
                );
            }

            await User.update(req.body, { where: { id: req.params.userId }, });

            let updatedUser = await User.findOne({
                where: { id: req.params.userId },
                include: [
                    {
                        model: UserImage,
                        as: 'UserImages',
                    },
                ],
            });

            return resp
                .status(200)
                .json({ success: true, user: updatedUser, successmessage: 'Profile updated successfully' });
        } catch (error) {
            resp.status(500).json({ success: false, error: error.message });
        }
    },

    async logOut(req, resp) {
        try {
            const id = req.params.userId;
            const status = await User.findByPk(id);

            await status.update({ status: 'offline' });

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
            resp.status(500).json({ success: false, error: error.message });
        }
    },

    async verifyUser(req, resp) {
        try {
            const { contact, otp } = req.body;
            const user = await User.findOne({ where: { contact, otp } });
            if (user) {
                resp.json({ success: true, message: 'OTP verified successfully' })
            } else {
                resp.status(400).json({ success: false, message: 'Invalid OTP' });
            }

        } catch (error) {
            resp.status(500).json({ success: false, error: error.message });
        }
    },

    async forgetPassword(req, resp) {
        const { email } = req.body;

        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return resp.status(404).json({ message: 'User not found' });
            }

            // Generate reset token and save it to the database
            const resetToken = jwt.sign({ _id: user.id }, 'chat-app' + user.password, { expiresIn: "15m" });

            user.resetToken = resetToken;
            await user.save();

            // Send an email with the reset link
            await sendResetEmail(email, resetToken);

            resp.status(200).json({ success: true, message: 'Reset link sent successfully' });
        } catch (error) {
            resp.status(500).json({ error: error, message: 'Internal Server Error' });
        }
    },

    async resetPassword(req, resp) {
        const { resetToken, newPassword } = req.body;

        try {
            const user = await User.findOne({ where: { resetToken } });

            if (!user) {
                return resp.status(401).json({ message: 'Invalid reset token' });
            }

            // Update the password and reset token
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            user.resetToken = null;
            await user.save();

            resp.json({ success: true, successmessage: 'Password reset successfully' })
        } catch (error) {
            console.error(error);
            resp.status(500).json({ message: 'Internal Server Error' });
        }
    },

    async callBackFunction(req, resp) {
        let value = {
            firstname: req.user.name.givenName,
            lastname: req.user.name.familyName,
            contact: null,
            email: req.user.emails[0].value,
        }
        let conditions = { where: { email: req.user.emails[0].value } };
        let user = await createOrUpdate(value, conditions, User);

        let imageValue = {
            userId: user.id,
            fileType: 'social_image',
            fileName: '',
            filePath: req.user.photos[0].value
        }
        let imageConditions = { where: { userId: user.id } };

        await createOrUpdate(imageValue, imageConditions, UserImage);

        await dialogClose(resp);
    }
}

const createOrUpdate = async (values, condition, model) => {
    let response = model.findOne(condition)
        .then(async (obj) => {
            // update
            if (obj && obj?.dataValues) {
                return obj.update(values);
            } else {
                // insert
                return model.create(values);
            }
        });
    return response;
};


const dialogClose = async (resp) => {
    const html = `
        <html>
            <head>
                <title>Main</title>
            </head>
            <body></body>
            <script>window.location.href = "http://localhost:4200/";</script>
        </html>`;

    // Set the appropriate content type for the response
    resp.header('Content-Type', 'text/html');

    // Send the HTML as the response
    resp.send(html);
}

const sendResetEmail = async (email, resetToken) => {

    const transporter = nodemailer.createTransport({
        // service: 'gmail',
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: '9358a0c9e0f048',
            pass: 'f62c6d4aa031f5',
        },
    });

    const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: 'manisha.mangoit@gmail.com',
        to: email,
        subject: 'Password Reset',
        // text: `Click on the following link to reset your password: ${resetLink}`,
        // You can also use HTML for a more styled email:
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };

    return new Promise((resolve, reject) => {
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                console.log(`Email sent: ${info.response}`);
                resolve(info.response);
            }
        });
    });
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
    } catch (error) {
        console.error(error);
        return false;
    }
};


