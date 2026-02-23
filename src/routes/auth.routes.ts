import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { UserRole } from "../types/roles";

// Test route to verify auth and role middlewares
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.post("/login", login);

// Test route to verify auth and role middlewares
router.get("/admin-test", protect, authorize(UserRole.ADMIN), (req, res) => {
  res.json({ message: "Admin access granted" });
});

export default router;
