import multer from "multer"
import config from '../config.js'
import ensurePathExists from '../helpers/pathing.js'

const storage = multer.diskStorage({
    destination: function( req, res, cb ) {
        try {
            const { tenantId } = req.params;
            ensurePathExists(config.CONTRACT)

            const savePath = config.CONTRACT + tenantId + '/';
            ensurePathExists(savePath)
            cb(null, savePath)

        } catch (error) {
            cb(new Error(error.message))
        }
    },
	filename: function ( req, file, cb ) {
		const {tenantId} = req.params;
		cb(null, tenantId + `.pdf`)
	}
})

const uploadContract = multer({
    storage: storage,
    limits: 5 * 1024 * 1024,
    fileFilter: (req, file, cb) => {
        const filetype = file.originalname.split('.').pop()
        if ( config.ALLOWED_FILETYPES.includes(filetype) ) {
            cb(null, true)
        } else {
            return cb(new Error("FILE_NOT_ALLOWED"))
        }
    }
}).single('contract')

export { uploadContract };