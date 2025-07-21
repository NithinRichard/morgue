import express from 'express';
import * as controller from '../controllers/dataController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Body:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         timeOfDeath: { type: string, format: date-time }
 *         status: { type: string }
 *         riskLevel: { type: string }
 *         storageUnit: { type: string }
 *         incidentType: { type: string }
 *         verifiedBy: { type: string }
 *         registrationDate: { type: string, format: date-time }
 *     Exit:
 *       allOf:
 *         - $ref: '#/components/schemas/Body'
 *         - type: object
 *           properties:
 *             exitDate: { type: string, format: date-time }
 *             receiverName: { type: string }
 *             receiverId: { type: string }
 *             relationship: { type: string }
 *             releaseTime: { type: string }
 *             remarks: { type: string }
 *             witnessingStaff: { type: string }
 *             receiverType: { type: string }
 *             receiverIdProof: { type: string }
 *             releaseConditions: { type: string }
 *     Discharge:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         dischargeStatus: { type: string }
 */
/**
 * @swagger
 * /bodies:
 *   get:
 *     summary: Get all bodies
 *     responses:
 *       200:
 *         description: List of bodies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Body'
 *   post:
 *     summary: Add a new body
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Body'
 *     responses:
 *       201:
 *         description: Body created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Body'
 */
router.get('/bodies', controller.getBodies);
router.post('/bodies', controller.addBody);

/**
 * @swagger
 * /bodies/{id}:
 *   get:
 *     summary: Get a body by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Body found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Body'
 *       404:
 *         description: Body not found
 *   patch:
 *     summary: Update a body
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Body'
 *     responses:
 *       200:
 *         description: Body updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Body'
 *   delete:
 *     summary: Delete a body
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Body deleted
 */
router.get('/bodies/:id', controller.getBodyById);
router.patch('/bodies/:id', controller.patchBody);
router.delete('/bodies/:id', controller.deleteBody);

/**
 * @swagger
 * /bodies/{id}/verify:
 *   post:
 *     summary: Verify a body
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verifiedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Body verified
 */
router.post('/bodies/:id/verify', controller.verifyBody);

/**
 * @swagger
 * /bodies/{id}/verify-log:
 *   patch:
 *     summary: Log body verification
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             # Add fields as needed
 *     responses:
 *       200:
 *         description: Verification logged
 *   get:
 *     summary: Get body verification log
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification log
 */
router.patch('/bodies/:id/verify-log', controller.logBodyVerification);
router.get('/bodies/:id/verify-log', controller.getBodyVerifyLog);

/**
 * @swagger
 * /exits:
 *   get:
 *     summary: Get all exits
 *     responses:
 *       200:
 *         description: List of exits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exit'
 */
router.get('/exits', controller.getExits);

/**
 * @swagger
 * /exits/{id}:
 *   post:
 *     summary: Add an exit record for a body
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exit'
 *     responses:
 *       200:
 *         description: Exit record created
 */
router.post('/exits/:id', controller.addExit);

/**
 * @swagger
 * /discharges:
 *   get:
 *     summary: Get all discharges
 *     responses:
 *       200:
 *         description: List of discharges
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discharge'
 */
router.get('/discharges', controller.getDischarges);

/**
 * @swagger
 * /discharges/{id}:
 *   get:
 *     summary: Get a discharge by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Discharge found
 */
router.get('/discharges/:id', controller.getDischargeById);

/**
 * @swagger
 * /analytics/admissions:
 *   get:
 *     summary: Get admissions count
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Admissions count
 */
router.get('/analytics/admissions', controller.getAdmissionsCount);

/**
 * @swagger
 * /analytics/releases:
 *   get:
 *     summary: Get releases count
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Releases count
 */
router.get('/analytics/releases', controller.getReleasesCount);

/**
 * @swagger
 * /analytics/average-duration:
 *   get:
 *     summary: Get average storage duration
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Average duration
 */
router.get('/analytics/average-duration', controller.getAverageStorageDuration);

/**
 * @swagger
 * /analytics/capacity-usage:
 *   get:
 *     summary: Get capacity usage
 *     responses:
 *       200:
 *         description: Capacity usage
 */
router.get('/analytics/capacity-usage', controller.getCapacityUsage);

/**
 * @swagger
 * /analytics/trends:
 *   get:
 *     summary: Get occupancy trends
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Trends data
 */
router.get('/analytics/trends', controller.getTrends);

/**
 * @swagger
 * /reports/pending-verifications:
 *   get:
 *     summary: Get pending verifications
 *     responses:
 *       200:
 *         description: Pending verifications
 */
router.get('/reports/pending-verifications', controller.getPendingVerifications);

/**
 * @swagger
 * /reports/average-stay-duration:
 *   get:
 *     summary: Get average stay duration
 *     responses:
 *       200:
 *         description: Average stay duration
 */
router.get('/reports/average-stay-duration', controller.getAverageStayDuration);

/**
 * @swagger
 * /reports/occupancy-trends:
 *   get:
 *     summary: Get occupancy trends
 *     responses:
 *       200:
 *         description: Occupancy trends
 */
router.get('/reports/occupancy-trends', controller.getOccupancyTrends);

/**
 * @swagger
 * /reports/body-movements:
 *   get:
 *     summary: Get body movement logs
 *     responses:
 *       200:
 *         description: Body movement logs
 */
router.get('/reports/body-movements', controller.getBodyMovements);

/**
 * @swagger
 * /reports/department-death-logs:
 *   get:
 *     summary: Get department death logs
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department death logs
 */
router.get('/reports/department-death-logs', controller.getDepartmentDeathLogs);

/**
 * @swagger
 * /incident_types:
 *   get:
 *     summary: Get all incident types
 *     responses:
 *       200:
 *         description: List of incident types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/IncidentType'
 */
// router.get('/incident_types', controller.getIncidentTypes);

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Get all status values
 *     responses:
 *       200:
 *         description: List of status values
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Status'
 */
// router.get('/status', controller.getStatus);

/**
 * @swagger
 * /risk_levels:
 *   get:
 *     summary: Get all risk levels
 *     responses:
 *       200:
 *         description: List of risk levels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RiskLevel'
 */
// router.get('/risk_levels', controller.getRiskLevels);

/**
 * @swagger
 * /storage_status:
 *   get:
 *     summary: Get all storage unit statuses
 *     responses:
 *       200:
 *         description: List of storage unit statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StorageStatus'
 */
// router.get('/storage_status', controller.getStorageStatus);

/**
 * @swagger
 * /relationship_types:
 *   get:
 *     summary: Get all relationship types
 *     responses:
 *       200:
 *         description: List of relationship types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RelationshipType'
 */
// router.get('/relationship_types', controller.getRelationshipTypes);

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: Get all providers
 *     responses:
 *       200:
 *         description: List of providers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Provider'
 */
// router.get('/providers', controller.getProviders);

/**
 * @swagger
 * /outlets:
 *   get:
 *     summary: Get all outlets
 *     responses:
 *       200:
 *         description: List of outlets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Outlet'
 */
// router.get('/outlets', controller.getOutlets);

/**
 * @swagger
 * /staff_roles:
 *   get:
 *     summary: Get all staff roles
 *     responses:
 *       200:
 *         description: List of staff roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StaffRole'
 */
// router.get('/staff_roles', controller.getStaffRoles);

/**
 * @swagger
 * components:
 *   schemas:
 *     IncidentType:
 *       type: object
 *       properties:
 *         IT_Id_pk:
 *           type: string
 *         IT_type:
 *           type: string
 *         IT_desc:
 *           type: string
 *     Status:
 *       type: object
 *       properties:
 *         ST_Id_pk:
 *           type: string
 *         ST_status:
 *           type: string
 *         ST_desc:
 *           type: string
 *     RiskLevel:
 *       type: object
 *       properties:
 *         RL_Id_pk:
 *           type: string
 *         RL_level:
 *           type: string
 *         RL_desc:
 *           type: string
 *     StorageStatus:
 *       type: object
 *       properties:
 *         SS_Id_pk:
 *           type: string
 *         SS_status:
 *           type: string
 *         SS_desc:
 *           type: string
 *     RelationshipType:
 *       type: object
 *       properties:
 *         RT_Id_pk:
 *           type: string
 *         RT_type:
 *           type: string
 *         RT_desc:
 *           type: string
 *     Provider:
 *       type: object
 *       properties:
 *         PR_Id_pk:
 *           type: string
 *         PR_name:
 *           type: string
 *     Outlet:
 *       type: object
 *       properties:
 *         OT_Id_pk:
 *           type: string
 *         OT_name:
 *           type: string
 *     StaffRole:
 *       type: object
 *       properties:
 *         SR_Id_pk:
 *           type: string
 *         SR_role:
 *           type: string
 */
export default router; 