import { Router } from "express";
import {
  createMember,
  createTeamLead,
  exportAttendance,
  getAllMembers,
  getMembersByTeamLead,
  markTeamLeadAttendance,
} from "../controllers/admin.controller";
import { protect } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { UserRole } from "../types/roles";

const router = Router();

router.use(protect);
router.use(authorize(UserRole.ADMIN));

router.post("/team-lead", createTeamLead);
router.post("/member", createMember);
router.get("/members", getAllMembers);
router.get("/members/:teamLeadId", getMembersByTeamLead);
router.post("/team-lead-attendance", markTeamLeadAttendance);
router.get("/export-attendance", exportAttendance);

export default router;
