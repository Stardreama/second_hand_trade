// routes/users.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// 示例路由：获取用户列表
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    next(createError(500, "Error fetching users from the database"));
  }
});

export default router;