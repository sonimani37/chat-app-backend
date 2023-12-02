var express = require("express");
var router = express.Router();

const authRouters = require('./auth/auth-route');

const chatRoutes = require('./chat/chat-routes');

const groupRoutes = require('./group/group-routes');


router.get("/", (req, res) => {
    res.status(200).json({
        content: " Welcome",
        status: 200,
    });
});

router.use('/',authRouters);

router.use('/chat',chatRoutes);

router.use('/group',groupRoutes);

module.exports = router;
