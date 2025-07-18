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
router.get('/bodies/:id/verify-log', controller.getBodyVerifyLog);

router.get('/exits', controller.getExits);
router.post('/exits/:id', controller.addExit);

router.get('/discharges', controller.getDischarges);
router.get('/discharges/:id', controller.getDischargeById);

router.get('/analytics/admissions', controller.getAdmissionsCount);
router.get('/analytics/releases', controller.getReleasesCount);
router.get('/analytics/average-duration', controller.getAverageStorageDuration);
router.get('/analytics/capacity-usage', controller.getCapacityUsage);
router.get('/analytics/trends', controller.getTrends);
router.get('/reports/pending-verifications', controller.getPendingVerifications);
router.get('/reports/average-stay-duration', controller.getAverageStayDuration);
router.get('/reports/occupancy-trends', controller.getOccupancyTrends);
router.get('/reports/body-movements', controller.getBodyMovements);
router.get('/reports/department-death-logs', controller.getDepartmentDeathLogs);

export default router; 