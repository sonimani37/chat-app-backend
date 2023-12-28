
const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        console.log(file);

        if(file.mimetype.includes('image')) {
            cb(null, 'uploads/images'); // Set your upload directory

        }else if(file.mimetype.includes('application')) {
            cb(null, 'uploads/docs'); 

        }else if(file.mimetype.includes('audio')) {
            cb(null, 'uploads/audios'); 

        }else if(file.mimetype.includes('video')) {
            cb(null, 'uploads/videos'); 
        }   
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