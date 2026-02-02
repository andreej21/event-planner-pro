const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const commentCtrl = require("../controllers/commentController");

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Избриши коментар
 *     description: Избриши коментар по ID. Само сопственикот на коментарот или админ може да го избришат. Потребен е JWT токен во Authorization header (Bearer token).
 *     tags:
 *       - Коментари
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID на коментарот
 *     responses:
 *       200:
 *         description: Коментар успешно избришан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Deleted
 *       401:
 *         description: Не сте логирани - недостасува или невалиден JWT токен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized to access this route"
 *       403:
 *         description: Немаше право да го избришете коментарот (не е вашиот коментар)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       404:
 *         description: Коментар не пронајден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Comment not found"
 */
router.delete("/:id", protect, commentCtrl.deleteComment);

module.exports = router;
