const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.resolve(__dirname,'..')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/';
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir,{recursive: true});
        }
        cb(null, dir);  // Directory where files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Rename the file to avoid conflicts
    }
});

// Initialize Multer with the storage configuration
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1 * 2048 * 2048 } // 2MB in bytes
    ,
    fileFilter: (req,file,cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLocaleLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if(mimetype && extname) {
            return cb(null,true);
        } else {
            cb(new Error('Error: Image Only'));
        }

        if (err) {
            return res.status(400).json({ error: 'An error occurred' });
        }
       
    }
    
}).single('file');

module.exports = { 
    upload,
    UPLOADS_DIR 
};