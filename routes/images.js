import express from "express";
const router = express.Router();

import { uploadProfile } from '../middlewares/storage-engine.avatars.js';
import { uploadavatar, getavatar, renderavatar } from '../controllers/Images/avatar.js';

import { uploadMenu } from '../middlewares/storage-engine.menu.js';
import { uploadmenu, getmenu, rendermenu } from '../controllers/Images/menu.js';

import { uploadPromo } from '../middlewares/storage-engine.promo.js';
import { uploadpromo, getpromo,renderpromo } from '../controllers/Images/promo.js';

import { uploadContract } from '../middlewares/storage-engine.contract.js';
import { uploadcontract, getcontract } from '../controllers/Images/contract.js';

import { uploadFoodcourt } from '../middlewares/storage-engine.foodcourts.js';
import { uploadLogo, getLogo, renderDefault, renderLogo } from '../controllers/Images/foodcourt.js';

router.post('/avatar/:tenantId', uploadProfile, uploadavatar)
router.get ('/avatar/:tenantId', getavatar)
router.get ('/avatar/render/:imageName', renderavatar)

router.post('/logo/:foodcourt_id', uploadFoodcourt, uploadLogo)
router.get ('/logo/:foodcourt_id', getLogo)
router.get ('/logo/render/:imageName', renderLogo)
router.get ('/foodcourt/render/:imageName', renderDefault)

router.post('/menu/:tenantId/:menu_name', uploadMenu, uploadmenu)
router.get ('/menu/:tenantId/:menuId', getmenu)
router.get ('/menu/render/:tenantId/:imageName', rendermenu)

router.post('/promo/:tenantId/:promo_name', uploadPromo, uploadpromo)
router.get ('/promo/:tenantId/:promoId', getpromo)
router.get ('/promo/render/:tenantId/:imageName', renderpromo)

router.post('/contract/:tenantId', uploadContract, uploadcontract)
router.get ('/contract/:tenantId', getcontract)

export default router;