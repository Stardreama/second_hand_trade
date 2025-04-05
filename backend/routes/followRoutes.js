// routes/followRoutes.js
const express = require("express");
const router = express.Router();
const jwtService = require("../services/jwtService");
const { followSeller, unfollowSeller, getFollowStatus } = require("../controllers/followController");

// 关注接口：POST /api/user/follow
router.post("/follow", jwtService.authMiddleware, followSeller);

// 取消关注接口：DELETE /api/user/follow
router.delete("/follow", jwtService.authMiddleware, unfollowSeller);

// 检查关注状态接口：GET /api/user/follow/status?followee_id=xxx
router.get("/follow/status", jwtService.authMiddleware, getFollowStatus);

module.exports = router;
