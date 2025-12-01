import dbPool from '../database.js';
import crypto from "crypto";


export async function findUserByEmail(email) {
  const [rows] = await dbPool.execute('SELECT * FROM User WHERE Email = ?', [email]);
  return rows && rows.length ? rows[0] : null;
}

export async function findUserById(id) {
  const [rows] = await dbPool.execute('SELECT * FROM User WHERE UserID = ?', [id]);
  return rows && rows.length ? rows[0] : null;
}

export async function createUser({ name, email, password, role }) {
  const seed = `${Date.now()}-${Math.random()}`;
  const hash = crypto.createHash("sha1").update(seed).digest("hex");
  const num = parseInt(hash.slice(0, 8), 16) % 100000000;
  const ID = num.toString().padStart(8, "0");

  const [result] = await dbPool.execute(
    'INSERT INTO User (UserID, FullName, Email, Password, Role) VALUES (?, ?, ?, ?, ?)',
    [ID, name, email, password, role]
  );
  // console.log('createduser', result);
  return ID;
}

export async function _updateUser({ id, email, full_name, phone, introduce, faculty }) {
  const [result] = await dbPool.execute(
    `UPDATE User SET Email = ?, FullName = ?, Phone = ?, Introduce = ?, Faculty = ? WHERE UserID = ?`,
    [
      email ?? "",
      full_name ?? "-",
      phone ?? null, // undefined can't be used
      introduce ?? "Chưa cập nhật",
      faculty ?? null,
      id
    ]
  );
  return result;
}


export async function getStudentInfoById(id) {
  const [rows] = await dbPool.execute(
    'SELECT StudentCode FROM Student WHERE StudentID = ?',
    [id]
  );
  return rows && rows.length ? rows[0] : null;
}

export async function upsertStudentCode({ id, studentCode }) {
  const normalized = String(studentCode ?? '').trim();
  if (!normalized) {
    return null;
  }
  const [result] = await dbPool.execute(
    `INSERT INTO Student (StudentID, StudentCode)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE StudentCode = VALUES(StudentCode)`,
    [id, normalized]
  );
  return result;
}

export async function getTutorInfoById(id) {
  const [courseRows] = await dbPool.execute(
    'SELECT CourseID FROM TutorCourseRegistration WHERE UserID = ? ORDER BY CourseID',
    [id]
  );

  if (!courseRows && courseRows.length < 1) {
    return null;
  }
  const codes = courseRows
    .map((row) => String(row.CourseID || '').trim())
    .filter(Boolean);
  if (codes.length) {
    return { Major: codes.join(';') };
  }
}

export async function upsertTutorMajor({ tutorId, courseCodes }) {
  const normalizedCodes = Array.from(
    new Set(
      (courseCodes ?? [])
        .map((code) => String(code || '').trim())
        .filter(Boolean)
    )
  );

  if (normalizedCodes.length < 1) return null;

  const placeholders = normalizedCodes.map(() => '(?, ?)').join(', ');
  const values = normalizedCodes.flatMap((code) => [tutorId, code]);
  const [result] = await dbPool.execute(
    `INSERT INTO TutorCourseRegistration (UserID, CourseID) VALUES ${placeholders}`,
    values
  );

  return result;
}


