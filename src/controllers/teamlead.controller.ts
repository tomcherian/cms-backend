import { Request, Response } from "express";
import Member from "../models/member.model";
import Attendance from "../models/attendance.model";
import { AttendanceStatus } from "../types/attendance";


// GET MY MEMBERS
export const getMyMembers = async (req: Request, res: Response) => {
  try {
    const members = await Member.find({
      teamLead: req.user?.id
    });

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// MARK MEMBER ATTENDANCE
export const markMemberAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const { memberId, status, reason } = req.body as {
      memberId: string;
      status: AttendanceStatus;
      reason?: string;
    };

    const member = await Member.findOne({
      _id: memberId,
      teamLead: req.user?.id
    });

    if (!member) {
      return res.status(403).json({
        message: "Not allowed to mark attendance for this member"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      member: memberId,
      date: today
    });

    if (existing) {
      existing.status = status;
      existing.reason = reason;
      await existing.save();
      return res.json(existing);
    }

    const attendance = await Attendance.create({
      member: memberId,
      teamLead: req.user?.id,
      date: today,
      status,
      reason
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// VIEW ATTENDANCE HISTORY FOR MY MEMBERS
export const getMyAttendanceHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    const filter: any = {
      teamLead: req.user?.id
    };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(filter)
      .populate("member", "name")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};