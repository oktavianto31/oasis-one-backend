import multer from 'multer';
import config from '../config.js';
import ensurePathExists from '../helpers/pathing.js';

const storage = multer.diskStorage({
    destination: function ( req, res, cb ) {
        try {
            const savePath  = config.FOODCOURT + 'logo/';
            ensurePathExists( savePath );
            console.log( "Storage directory : " + savePath )
            cb(null, savePath)
        } catch (error) {
            cb(new Error(error.message))
        }
    },
	filename: function ( req, file, cb ) {
        const { foodcourt_id } = req.params;
		cb(null, foodcourt_id + `.jpg`)
	}
})

const uploadFoodcourt = multer({
    storage : storage,
    limits  : 2  * 1024 * 1024,
    fileFilter: (req, file, cb) => {
        const filetype = file.originalname.split('.').pop()
        if ( config.ALLOWED_FILETYPES.includes(filetype) ) {
            console.log( "Image saved with type " + filetype )
            cb(null, true)
        } else {
            return cb(new Error("FILE_NOT_ALLOWED"))
        }
    }
}).single('foodcourt')

export { uploadFoodcourt };