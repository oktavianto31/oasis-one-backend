import fs from 'fs'
import config from '../../config.js'
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadcontract(req, res) {
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

async function rendercontract(req, res) {
    try {
      const { tenantId } = req.params;
      const imagePath = path.join(__dirname, "../../storage/contract/", tenantId);
      const image = fs.readFileSync(imagePath);
  
      res.writeHead(200, { "Content-Type": "application/pdf" });
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

async function getcontract(req, res) {
    try {
        const { tenantId } = req.params;
        const imageDirPath = config.CONTRACT + tenantId
        const images = fs.readdirSync(imageDirPath);
        
        const imagePath = config.CONTRACT + tenantId + `/${images[0]}`
        const image = fs.readFileSync(imagePath);
        
        res.writeHead(200, {'Content-Type': "application/pdf"})
        res.write(image)
        return res.end()

    } catch (error) {
        return res.status(500).json({
            status: 'ERROR', 
            message: error.message
        })
    }
}

export { uploadcontract,rendercontract, getcontract }