import { Router } from "express";
import {
  getMyAttendanceHistory,
  getMyMembers,
  markMemberAttendance,
} from "../controllers/teamlead.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { UserRole } from "../types/roles";

const router = Router();

router.use(protect);
router.use(authorize(UserRole.TEAM_LEAD));

router.get("/members", getMyMembers);
router.post("/attendance", markMemberAttendance);
router.get("/attendance-history", getMyAttendanceHistory);

export default router;
