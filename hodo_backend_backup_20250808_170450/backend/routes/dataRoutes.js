import express from 'express';
import * as controller from '../controllers/dataController.js';

const router = express.Router();

router.get('/bodies/:id/verify-log', controller.getBodyVerifyLog);

/**
 * @swagger
 * /exits-with-storage-info:
 *   get:
 *     summary: Get all exits with storage allocation info
 *     tags: [Exit Management]
 *     responses:
 *       200:
 *         description: List of exits with body and storage allocation details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/exits-with-storage-info',controller.getExitsWithStorageInfo);

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

// Expired patients route (with optional trailing slash)
router.get(['/expired-patients', '/expired-patients/'], controller.getExpiredPatients);

/**
 * @swagger
 * /discharges:
 *   get:
 *     summary: Get all discharge records
 *     tags: [Discharges]
 *     responses:
 *       200:
 *         description: List of discharge records
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
// router.get('/exits', controller.getExits);

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

// =====================================================
// NEW EXIT TABLES API ENDPOINTS
// =====================================================

/**
 * @swagger
 * /exit-types:
 *   get:
 *     summary: Get all exit types
 *     tags: [Exit Management]
 *     responses:
 *       200:
 *         description: List of exit types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ETL_Id_pk: { type: integer }
 *                   ETL_Type_Name: { type: string }
 *                   ETL_Description: { type: string }
 *                   ETL_Requires_Verification: { type: boolean }
 *                   ETL_Requires_NOC: { type: boolean }
 *                   ETL_Requires_Authorization: { type: boolean }
 */
router.get('/exit-types', controller.getExitTypes);

/**
 * @swagger
 * /exit-statuses:
 *   get:
 *     summary: Get all exit statuses
 *     tags: [Exit Management]
 *     responses:
 *       200:
 *         description: List of exit statuses
 */
router.get('/exit-statuses', controller.getExitStatuses);

/**
 * @swagger
 * /receiver-types:
 *   get:
 *     summary: Get all receiver types
 *     tags: [Exit Management]
 *     responses:
 *       200:
 *         description: List of receiver types
 */
router.get('/receiver-types', controller.getReceiverTypes);

/**
 * @swagger
 * /id-proof-types:
 *   get:
 *     summary: Get all ID proof types
 *     tags: [Exit Management]
 *     responses:
 *       200:
 *         description: List of ID proof types
 */
router.get('/id-proof-types', controller.getIdProofTypes);

/**
 * @swagger
 * /relationships:
 *   get:
 *     summary: Get all relationships
 *     tags: [Exit Management]
 *     responses:
 *       200:
 *         description: List of relationships
 */
router.get('/relationships', controller.getRelationships);

/**
 * @swagger
 * /authorization-levels:
 *   get:
 *     summary: Get all authorization levels
 *     tags: [Exit Management]
 *     responses:
 *       200:
 *         description: List of authorization levels
 */
router.get('/authorization-levels', controller.getAuthorizationLevels);

/**
 * @swagger
 * /exit-bodies:
 *   get:
 *     summary: Get all exit body records
 *     tags: [Exit Management]
 *     responses:
 *       200:
 *         description: List of exit body records
 *   post:
 *     summary: Create a new exit body record
 *     tags: [Exit Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               EB_Body_Details_FK: { type: integer }
 *               EB_Exit_Type_FK: { type: integer }
 *               EB_Exit_Status_FK: { type: integer }
 *               EB_Exit_Date: { type: string, format: date-time }
 *               EB_Exit_Time: { type: string }
 *               EB_Exit_Reason: { type: string }
 *               EB_Requires_NOC: { type: boolean }
 *               EB_NOC_Number: { type: string }
 *               EB_NOC_Issued_Date: { type: string, format: date-time }
 *               EB_Requires_Authorization: { type: boolean }
 *               EB_Authorization_Level_FK: { type: integer }
 *               EB_Authorized_By: { type: string }
 *               EB_Authorization_Date: { type: string, format: date-time }
 *               EB_Remarks: { type: string }
 *               EB_Added_by: { type: string }
 *               EB_Provider_fk: { type: integer }
 *               EB_Outlet_fk: { type: integer }
 */
router.get('/exit-bodies', controller.getExitBodies);
router.post('/exit-bodies', controller.createExitBody);

/**
 * @swagger
 * /exit-bodies/{id}:
 *   get:
 *     summary: Get exit body record by ID
 *     tags: [Exit Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *   put:
 *     summary: Update exit body record
 *     tags: [Exit Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *   delete:
 *     summary: Delete exit body record
 *     tags: [Exit Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/exit-bodies/:id', controller.getExitBodyById);
router.put('/exit-bodies/:id', controller.updateExitBody);
router.delete('/exit-bodies/:id', controller.deleteExitBody);

/**
 * @swagger
 * /exit-receivers:
 *   get:
 *     summary: Get all exit receivers
 *     tags: [Exit Management]
 *     responses:
 *       200:
 *         description: List of exit receivers
 *   post:
 *     summary: Create a new exit receiver
 *     tags: [Exit Management]
 */
router.get('/exit-receivers', controller.getExitReceivers);
router.post('/exit-receivers', controller.createExitReceiver);

/**
 * @swagger
 * /exit-receivers/{id}:
 *   get:
 *     summary: Get exit receiver by ID
 *     tags: [Exit Management]
 *   put:
 *     summary: Update exit receiver
 *     tags: [Exit Management]
 *   delete:
 *     summary: Delete exit receiver
 *     tags: [Exit Management]
 */
router.get('/exit-receivers/:id', controller.getExitReceiverById);
router.put('/exit-receivers/:id', controller.updateExitReceiver);
router.delete('/exit-receivers/:id', controller.deleteExitReceiver);

/**
 * @swagger
 * /exit-documents:
 *   get:
 *     summary: Get all exit documents
 *     tags: [Exit Management]
 *   post:
 *     summary: Create a new exit document
 *     tags: [Exit Management]
 */
router.get('/exit-documents', controller.getExitDocuments);
router.post('/exit-documents', controller.createExitDocument);

/**
 * @swagger
 * /exit-documents/{id}:
 *   get:
 *     summary: Get exit document by ID
 *     tags: [Exit Management]
 *   put:
 *     summary: Update exit document
 *     tags: [Exit Management]
 *   delete:
 *     summary: Delete exit document
 *     tags: [Exit Management]
 */
router.get('/exit-documents/:id', controller.getExitDocumentById);
router.put('/exit-documents/:id', controller.updateExitDocument);
router.delete('/exit-documents/:id', controller.deleteExitDocument);

/**
 * @swagger
 * /exit-clearances:
 *   get:
 *     summary: Get all exit clearances
 *     tags: [Exit Management]
 *   post:
 *     summary: Create a new exit clearance
 *     tags: [Exit Management]
 */
router.get('/exit-clearances', controller.getExitClearances);
router.post('/exit-clearances', controller.createExitClearance);

/**
 * @swagger
 * /exit-clearances/{id}:
 *   get:
 *     summary: Get exit clearance by ID
 *     tags: [Exit Management]
 *   put:
 *     summary: Update exit clearance
 *     tags: [Exit Management]
 *   delete:
 *     summary: Delete exit clearance
 *     tags: [Exit Management]
 */
router.get('/exit-clearances/:id', controller.getExitClearanceById);
router.put('/exit-clearances/:id', controller.updateExitClearance);
router.delete('/exit-clearances/:id', controller.deleteExitClearance);

/**
 * @swagger
 * /exit-witnesses:
 *   get:
 *     summary: Get all exit witnesses
 *     tags: [Exit Management]
 *   post:
 *     summary: Create a new exit witness
 *     tags: [Exit Management]
 */
router.get('/exit-witnesses', controller.getExitWitnesses);
router.post('/exit-witnesses', controller.createExitWitness);

/**
 * @swagger
 * /exit-witnesses/{id}:
 *   get:
 *     summary: Get exit witness by ID
 *     tags: [Exit Management]
 *   put:
 *     summary: Update exit witness
 *     tags: [Exit Management]
 *   delete:
 *     summary: Delete exit witness
 *     tags: [Exit Management]
 */
router.get('/exit-witnesses/:id', controller.getExitWitnessById);
router.put('/exit-witnesses/:id', controller.updateExitWitness);
router.delete('/exit-witnesses/:id', controller.deleteExitWitness);

/**
 * @swagger
 * /exit-handover-items:
 *   get:
 *     summary: Get all exit handover items
 *     tags: [Exit Management]
 *   post:
 *     summary: Create a new exit handover item
 *     tags: [Exit Management]
 */
router.get('/exit-handover-items', controller.getExitHandoverItems);
router.post('/exit-handover-items', controller.createExitHandoverItem);

/**
 * @swagger
 * /exit-handover-items/{id}:
 *   get:
 *     summary: Get exit handover item by ID
 *     tags: [Exit Management]
 *   put:
 *     summary: Update exit handover item
 *     tags: [Exit Management]
 *   delete:
 *     summary: Delete exit handover item
 *     tags: [Exit Management]
 */
router.get('/exit-handover-items/:id', controller.getExitHandoverItemById);
router.put('/exit-handover-items/:id', controller.updateExitHandoverItem);
router.delete('/exit-handover-items/:id', controller.deleteExitHandoverItem);

/**
 * @swagger
 * /exit-audit-trail:
 *   get:
 *     summary: Get exit audit trail
 *     tags: [Exit Management]
 *   post:
 *     summary: Create a new audit trail entry
 *     tags: [Exit Management]
 */
router.get('/exit-audit-trail', controller.getExitAuditTrail);
router.post('/exit-audit-trail', controller.createExitAuditTrail);

/**
 * @swagger
 * /exit-bodies/{id}/complete-exit:
 *   post:
 *     summary: Complete exit process for a body
 *     tags: [Exit Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receivers: { type: array, items: { type: object } }
 *               documents: { type: array, items: { type: object } }
 *               clearances: { type: array, items: { type: object } }
 *               witnesses: { type: array, items: { type: object } }
 *               handoverItems: { type: array, items: { type: object } }
 */
router.post('/exit-bodies/:id/complete-exit', controller.completeExitProcess);

/**
 * @swagger
 * /exit-bodies/{id}/receivers:
 *   get:
 *     summary: Get receivers for a specific exit body
 *     tags: [Exit Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/exit-bodies/:id/receivers', controller.getExitBodyReceivers);

/**
 * @swagger
 * /exit-bodies/{id}/documents:
 *   get:
 *     summary: Get documents for a specific exit body
 *     tags: [Exit Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/exit-bodies/:id/documents', controller.getExitBodyDocuments);

/**
 * @swagger
 * /exit-bodies/{id}/clearances:
 *   get:
 *     summary: Get clearances for a specific exit body
 *     tags: [Exit Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/exit-bodies/:id/clearances', controller.getExitBodyClearances);

/**
 * @swagger
 * /exit-bodies/{id}/witnesses:
 *   get:
 *     summary: Get witnesses for a specific exit body
 *     tags: [Exit Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/exit-bodies/:id/witnesses', controller.getExitBodyWitnesses);

/**
 * @swagger
 * /exit-bodies/{id}/handover-items:
 *   get:
 *     summary: Get handover items for a specific exit body
 *     tags: [Exit Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/exit-bodies/:id/handover-items', controller.getExitBodyHandoverItems);

/**
 * @swagger
 * /exit-bodies/{id}/audit-trail:
 *   get:
 *     summary: Get audit trail for a specific exit body
 *     tags: [Exit Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/exit-bodies/:id/audit-trail', controller.getExitBodyAuditTrail);

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
 * components:
 *   schemas:
 *     StorageAllocation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         bodyId:
 *           type: integer
 *         bodyName:
 *           type: string
 *         storageUnitId:
 *           type: integer
 *         storageUnitCode:
 *           type: string
 *         allocatedDate:
 *           type: string
 *           format: date-time
 *         expectedDurationDays:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [Active, Inactive, Released, Maintenance]
 *         priorityLevel:
 *           type: string
 *           enum: [Low, Normal, High, Urgent]
 *         temperatureRequired:
 *           type: number
 *           format: float
 *         currentTemperature:
 *           type: number
 *           format: float
 * 
 *     StorageAllocationInput:
 *       type: object
 *       required:
 *         - bodyId
 *         - storageUnitId
 *         - allocatedBy
 *         - providerId
 *       properties:
 *         bodyId:
 *           type: integer
 *         storageUnitId:
 *           type: integer
 *         allocatedBy:
 *           type: integer
 *         providerId:
 *           type: integer
 *         outletId:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [Active, Inactive, Released, Maintenance]
 *           default: Active
 *         priorityLevel:
 *           type: string
 *           enum: [Low, Normal, High, Urgent]
 *           default: Normal
 *         temperatureRequired:
 *           type: number
 *           format: float
 *           default: -18.0
 * 
 *     StorageUnit:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         unitCode:
 *           type: string
 *         unitName:
 *           type: string
 *         unitType:
 *           type: string
 *         location:
 *           type: string
 *         capacity:
 *           type: integer
 *         currentOccupancy:
 *           type: integer
 *         currentTemperature:
 *           type: number
 *           format: float
 *         status:
 *           type: string
 *         availableSpace:
 *           type: integer
 */

// Storage Allocation Routes
/**
 * @swagger
 * /storage-allocations:
 *   get:
 *     summary: Get all storage allocations
 *     responses:
 *       200:
 *         description: List of storage allocations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StorageAllocation'
 *   post:
 *     summary: Create a new storage allocation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StorageAllocationInput'
 *     responses:
 *       201:
 *         description: Storage allocation created
 */
router.get(['/storage-allocations', '/storage-allocations/'], controller.getStorageAllocations);
router.post('/storage-allocations/create-missing', controller.createMissingStorageAllocations);
router.post(['/storage-allocations', '/storage-allocations/'], controller.createStorageAllocation);
router.get('/storage-allocations/active-bodies', controller.getActiveStorageAllocations);

/**
 * @swagger
 * /storage-allocations/{id}/status:
 *   patch:
 *     summary: Update the status of a storage allocation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Released, Maintenance]
 *     responses:
 *       200:
 *         description: Storage allocation status updated
 */
router.patch(['/storage-allocations/:id/status', '/storage-allocations/:id/status/'], controller.updateStorageAllocationStatus);

/**
 * @swagger
 * /available-storage-units:
 *   get:
 *     summary: Get all available storage units
 *     responses:
 *       200:
 *         description: List of available storage units
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StorageUnit'
 */
router.get(['/available-storage-units', '/available-storage-units/'], controller.getAvailableStorageUnits);

// Debug endpoint - can be removed later
router.get('/debug/storage-allocations', controller.debugCheckStorageAllocations);

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