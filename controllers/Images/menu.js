import fs from 'fs'
import config from '../../config.js'
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadmenu(req, res) {
    try {
		return res.status(200).json({
            status: 'SUCCESS', 
            message: 'Upload successful'
        })
	} catch (error) {
		console.log(error)
		return res.status(500).json({
            status: 'ERROR', 
            message: error.message
        })
	}
}

async function rendermenu(req, res) {
    try {
      const { tenantId, imageName } = req.params;
      const imagePath = path.join(__dirname, "../../storage/menus/", tenantId, imageName);
      const image = fs.readFileSync(imagePath);

      res.writeHead(200, { "Content-Type": "image/jpg" });
      res.write(image);
      return res.end();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "ERROR",
        message: error.message,
      });
    }
  }

async function getmenu(req, res) {
    try {
        const { tenantId } = req.params;
        const imageDirPath = config.MENU + tenantId
        const images = fs.readdirSync(imageDirPath);
        
        const imagePath = config.MENU + tenantId + `/${images[0]}`
        const image = fs.readFileSync(imagePath);

        res.writeHead(200, {'Content-Type': "image/jpg"})
        res.write(image)
        return res.end()

    } catch (error) {
        return res.status(500).json({
            status: 'ERROR', 
            message: error.message
        })
    }
}

export { uploadmenu, getmenu,rendermenu }