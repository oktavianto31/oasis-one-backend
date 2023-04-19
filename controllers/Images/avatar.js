import fs from "fs";
import config from "../../config.js";
import path from "path";
import { fileURLToPath } from "url";
import Tenant from "../../models/tenantModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadavatar(req, res) {
  try {
    const { tenantId } = req.params;
    const imagePath = path.join(__dirname, "../../storage/avatars/", tenantId + '.jpg');
    // console.log( "Image path : " + imagePath );
   
    const files = fs.readFileSync(imagePath);
    if ( files.length === 0 )
    return res.status(404).json({ 
         status   : "ERROR", 
         message  : "No files found" 
      });

    const linkRoot =
      "https://backend.oasis-one.com/api/images/avatar/render/" + tenantId + '.jpg';

    // Find Tenant
    // const checkTenant = await Tenant.findOne({ 
    //   tenant_id  : tenantId 
    // });

    // if ( checkTenant ) {
    //   checkTenant.profileImage = linkRoot;
    //   await checkTenant.save();

    //   return res.status(200).json({
    //     status  : "SUCCESS",
    //     message : "Tenant Logo Upload Successfully",
    //     data    : checkTenant,
    //   });
    // }

    return res.status(200).json({
      status: "SUCCESS",
      message: linkRoot,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
}


async function renderavatar(req, res) {
  try {
    const { imageName } = req.params;
    const imagePath = path.join(__dirname, "../../storage/avatars/", imageName);
    
    // console.log( "Image path : " + imagePath );
    const image = fs.readFileSync(imagePath);

    res.writeHead(200, { "Content-Type": "image/jpg" });
    res.write(image);
    return res.end();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status  : "ERROR",
      message : error.message,
    });
  }
}

async function getavatar(req, res) {
  try {
    const { tenantId } = req.params;
    const imageDirPath = config.AVATAR + tenantId;
    const images = fs.readdirSync(imageDirPath);

    const imagePath = config.AVATAR + `/${images[0]}`;
    const image = fs.readFileSync(imagePath);

    res.writeHead(200, { "Content-Type": "image/jpg" });
    res.write(image);
    return res.end();
  } catch (error) {
    return res.status(500).json({
      status  : "ERROR",
      message : error.message,
    });
  }
}

export { uploadavatar, getavatar, renderavatar };
