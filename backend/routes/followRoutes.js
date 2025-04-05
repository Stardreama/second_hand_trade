// routes/followRoutes.js
const express = require("express");
const router = express.Router();
const jwtService = require("../services/jwtService");
const { followSeller, unfollowSeller, getFollowStatus, getFollowCounts,getFolloweesList,getFansList,getPublicFollowCounts } = require("../controllers/followController");

// 关注接口：POST /api/user/follow
router.post("/follow", jwtService.authMiddleware, followSeller);

// 取消关注接口：DELETE /api/user/follow
router.delete("/follow", jwtService.authMiddleware, unfollowSeller);

// 检查关注状态接口：GET /api/user/follow/status?followee_id=xxx
router.get("/follow/status", jwtService.authMiddleware, getFollowStatus);

// 获取关注数和粉丝数接口：GET /api/user/follow/count
router.get("/follow/count", jwtService.authMiddleware, getFollowCounts);

// 获取关注对象列表接口：GET /api/user/follow/list
router.get("/follow/list", jwtService.authMiddleware, getFolloweesList);

// 新建：获取我的粉丝列表
router.get('/fans/list', jwtService.authMiddleware, getFansList);


// 新增：无需Token验证的公开API，通过用户ID获取关注数和粉丝数
// GET /api/user/public/follow/count/:userId
router.get('/public/follow/count/:userId', getPublicFollowCounts);


module.exports = router;
