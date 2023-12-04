
const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set your upload directory
    },

    filename: function (req, file, cb) {
        if(file){
            cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        }
    },

});

var upload = multer({
    storage: storage,
    // fileFilter: function (req, file, callback) {
    //     callback(null, true);
    // },
    // limits: { fileSize: 2000000 },
});

module.exports = { upload };