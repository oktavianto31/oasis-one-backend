import fs from "fs";
import config from "../../config.js";
import path from "path";
import { fileURLToPath } from "url";
import Foodcourt from "../../models/foodcourtModel.js";

const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);

async function uploadLogo(req, res) {
   try {
      const { foodcourt_id } = req.params;
      const imagePath = path.join(__dirname, "../../storage/foodcourts/logo/", foodcourt_id + '.jpg');
      // const imagePath = path.join(__dirname, "../../storage/foodcourts/", foodcourt_id + '.jpg');
      console.log( "Image path : " + imagePath );

      const files = fs.readFileSync(imagePath);
      if ( files.length === 0 )
         return res.status(404).json({ 
            status   : "ERROR", 
            message  : "No files found" 
         });

      const linkRoot =
         "https://backend.oasis-one.com/api/images/logo/render/" + foodcourt_id + '.jpg';

      // Find Tenant
      const checkFoodcourt = await Foodcourt.findOne({ 
         foodcourt_id   : foodcourt_id 
      });

      if ( checkFoodcourt ) {
         checkFoodcourt.foodcourt_logo = linkRoot;
         await checkFoodcourt.save();

         return res.status(200).json({
            status   : "SUCCESS",
            message  : "Foodcourt Logo Upload Successfully",
            data     : checkFoodcourt,
         });
      }

      return res.status(200).json({
         status: "SUCCESS",
         message: linkRoot,
      });

   } catch (error) {
      console.log(error);
      return res.status(500).json({
         status   : "ERROR",
         message  : error.message,
      });
   }
}

async function renderLogo(req, res) {
   try {
      const { imageName } = req.params;
      const imagePath = path.join(__dirname, "../../storage/foodcourts/logo/", imageName);
      // const imagePath = path.join(__dirname, "../../storage/foodcourts/", imageName);
      
      console.log( "Image path : " + imagePath );
      const image = fs.readFileSync(imagePath);

      res.writeHead(200, { "Content-Type": "image/jpg" });
      res.write(image);
      return res.end();
   } catch (error) {
      console.log(error);
      return res.status(500).json({
         status   : "ERROR",
         message  : error.message,
      });
   }
}

async function renderDefault(req, res) {
   try {
      const { imageName } = req.params;
      const imagePath = path.join(__dirname, "../../storage/foodcourts/", imageName);
            
      console.log( "Image path : " + imagePath );
      const image = fs.readFileSync(imagePath);

      res.writeHead(200, { "Content-Type": "image/jpg" });
      res.write(image);
      return res.end();
   } catch (error) {
      console.log(error);
      return res.status(500).json({
         status   : "ERROR",
         message  : error.message,
      });
   }
}

async function getLogo(req, res) {
   try {
      const { foodcourt_id } = req.params;
      const imageDirPath = config.FOODCOURT + "/logo/" + foodcourt_id;
      // const imageDirPath = config.FOODCOURT + foodcourt_id;
      const images = fs.readdirSync(imageDirPath);

      const imagePath = config.FOODCOURT + `/${images[0]}`;
      const image = fs.readFileSync(imagePath);

      res.writeHead(200, { "Content-Type": "image/jpg" });
      res.write(image);
      return res.end();
   } catch (error) {
      return res.status(500).json({
         status   : "ERROR",
         message  : error.message,
      });
   }
}

export { uploadLogo, getLogo, renderDefault, renderLogo };
