import express from 'express';
import * as controller from '../controllers/dataController.js';

const router = express.Router();

router.get('/bodies', controller.getBodies);
router.post('/bodies', controller.addBody);
router.post('/bodies/:id/verify', controller.verifyBody);
router.patch('/bodies/:id/verify-log', controller.logBodyVerification);
router.get('/bodies/:id', controller.getBodyById);
router.patch('/bodies/:id', controller.patchBody);
router.delete('/bodies/:id', controller.deleteBody);

router.get('/exits', controller.getExits);
router.post('/exits/:id', controller.addExit);

router.get('/discharges', controller.getDischarges);
router.get('/discharges/:id', controller.getDischargeById);

export default router; 