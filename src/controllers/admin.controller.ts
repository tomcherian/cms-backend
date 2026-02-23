import { Request, Response } from "express";
import Attendance from "../models/attendance.model";
import Member from "../models/member.model";
import User from "../models/user.model";
import { AttendanceStatus } from "../types/attendance";
import { UserRole } from "../types/roles";

// CREATE TEAM LEAD
export const createTeamLead = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const teamLead = await User.create({
      name,
      email,
      password,
      role: UserRole.TEAM_LEAD,
    });

    res.status(201).json(teamLead);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE MEMBER
export const createMember = async (req: Request, res: Response) => {
  try {
    const { name, phone, teamLeadId } = req.body as {
      name: string;
      phone: string;
      teamLeadId: string;
    };

    const member = await Member.create({
      name,
      phone,
      teamLead: teamLeadId,
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL MEMBERS
export const getAllMembers = async (_req: Request, res: Response) => {
  try {
    const members = await Member.find().populate("teamLead", "name email");
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET MEMBERS BY TEAM LEAD
export const getMembersByTeamLead = async (req: Request, res: Response) => {
  try {
    const { teamLeadId } = req.params;

    const members = await Member.find({ teamLead: teamLeadId });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// MARK ATTENDANCE FOR TEAM LEAD
export const markTeamLeadAttendance = async (req: Request, res: Response) => {
  try {
    const { teamLeadId, status, reason } = req.body as {
      teamLeadId: string;
      status: AttendanceStatus;
      reason?: string;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      date: today,
      member: teamLeadId,
    });

    if (existing) {
      existing.status = status;
      existing.reason = reason;
      await existing.save();
      return res.json(existing);
    }

    const attendance = await Attendance.create({
      date: today,
      member: teamLeadId,
      teamLead: req.user?.id,
      status,
      reason,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// EXPORT ATTENDANCE DATA CSV
export const exportAttendance = async (req: Request, res: Response) => {
  try {
    const { date } = req.query as { date: string };

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      date: selectedDate,
    })
      .populate("member", "name")
      .populate("teamLead", "name");

    let csv = "Member,TeamLead,Status,Reason\n";

    attendance.forEach((record: any) => {
      csv += `${record.member.name},${record.teamLead.name},${record.status},${record.reason || ""}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("attendance.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
