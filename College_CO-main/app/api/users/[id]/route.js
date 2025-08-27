import { query } from "../../../lib/database";
import { verifyToken, getTokenFromRequest } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.id;

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const result = await query(`DELETE FROM users WHERE id = $1 RETURNING id`, [
      parseInt(userId),
    ]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("User deletion error:", error.stack);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
