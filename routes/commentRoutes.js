const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const commentCtrl = require("../controllers/commentController");

// delete by id
router.delete("/:id", protect, commentCtrl.deleteComment);

module.exports = router;
