const router = require("express").Router();
const controller = require("../controllers/examSchedule.controller");
const verifyJwt = require("../middlewares/verifyJwt");

/**
 * Exam Schedule Routes
 * All routes require JWT authentication
 * Base URL: /exam-schedules
 */

/**
 * POST /exam-schedules
 * Create a new exam schedule
 * Required fields: exam_title, start_datetime, end_datetime, exam_status, exam_category, exam_type
 */
router.post("/", verifyJwt, controller.createExamSchedule);

/**
 * GET /exam-schedules
 * Get all exam schedules with pagination, search, filter, and sort
 * Query parameters:
 *  - page: page number (default: 1)
 *  - limit: records per page (default: 10, max: 100)
 *  - search: search by exam_title
 *  - exam_status: filter by exam_status (Active|Inactive)
 *  - exam_category: filter by exam_category (Abacus|Vedic)
 *  - exam_type: filter by exam_type (Mock|Main Exam)
 */
router.get("/", verifyJwt, controller.getExamSchedules);

/**
 * GET /exam-schedules/export
 * Export exam schedules to JSON or CSV
 * Query parameters:
 *  - format: json or csv (default: json)
 *  - search: search term
 *  - exam_status: filter by status
 *  - exam_category: filter by category
 *  - exam_type: filter by type
 */
router.get("/export", verifyJwt, controller.exportExamSchedules);

/**
 * GET /exam-schedules/:id
 * Get single exam schedule by ID
 * Only returns if created_by matches authenticated user
 */
router.get("/:id", verifyJwt, controller.getExamScheduleById);

/**
 * PUT /exam-schedules/:id
 * Update exam schedule
 * Only updates if record belongs to authenticated user
 */
router.put("/:id", verifyJwt, controller.updateExamSchedule);

/**
 * DELETE /exam-schedules/:id
 * Delete exam schedule
 * Only deletes if record belongs to authenticated user
 */
router.delete("/:id", verifyJwt, controller.deleteExamSchedule);

module.exports = router;
