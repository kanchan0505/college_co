import { query } from "../../../lib/database";
import { verifyToken, getTokenFromRequest } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);

    if (!decoded || !["admin", "hod"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { faculty_id, subject_id, semester, batch_year, sections } = await request.json();

    // Insert or update sections if conflict occurs
    const result = await query(
      `INSERT INTO faculty_subjects (faculty_id, subject_id, semester, batch_year, sections)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (faculty_id, subject_id, semester, batch_year)
       DO UPDATE SET sections = EXCLUDED.sections
       RETURNING *`,
      [faculty_id, subject_id, semester, batch_year, sections]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Subject assignment error:", error);
    return NextResponse.json({ error: "Failed to assign subject" }, { status: 500 });
  }
}
