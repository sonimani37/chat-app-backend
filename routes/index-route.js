var express = require("express");
var router = express.Router();

const authRouters = require('./authroutes/auth-route');


router.get("/", (req, res) => {
    res.status(200).json({
        content: " Welcome",
        status: 200,
    });
});

console.log('index-route');

router.use('/auth',authRouters)

module.exports = router;
