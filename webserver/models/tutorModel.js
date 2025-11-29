import dbPool from '../database.js';
import crypto from "crypto";

export async function openClass(tutorId, start, end, day, method) {
    if (!tutorId || !start || !end || !day) {
        const e = new Error('MissingRequiredFields');
        e.code = 'MISSING_FIELDS';
        throw e;
    }
    if (/^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(end)) {
        if (start >= end) {
            const e = new Error('InvalidTimeRange');
            e.code = 'INVALID_TIME_RANGE';
            throw e;
        }
    }

    const seed = `${Date.now()}-${Math.random()}`;
    const hash = crypto.createHash('sha1').update(seed).digest('hex');
    const num = parseInt(hash.slice(0, 6), 16) % 1000000;
    const ID = num.toString().padStart(6, '0');

    await dbPool.execute(
        'INSERT INTO Class (ClassID, TutorID, StartTime, EndTime, TeachingDay, method) VALUES (?, ?, ?, ?, ?, ?)',
        [ID, tutorId, start, end, day, method]
    );

    return {
        id: ID,
        tutorId: String(tutorId),
        start,
        end,
        day,
        method: method || null,
    };
}

export async function getClassById(classId) {
    const [rows] = await dbPool.execute(
        'SELECT ClassID, TutorID, StartTime, EndTime, TeachingDay, method FROM Class WHERE ClassID = ? LIMIT 1',
        [classId]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
        id: r.ClassID,
        tutorId: String(r.TutorID),
        start: r.StartTime,
        end: r.EndTime,
        day: r.TeachingDay,
        method: r.method,
    };
}

export async function updateClass({ classId, tutorId, start, end, day, method }) {
    const existing = await getClassById(classId);
    if (!existing) return null;
    if (String(existing.tutorId) !== String(tutorId)) {
        const e = new Error('NotOwner');
        e.code = 'NOT_OWNER';
        throw e;
    }

    const sets = [];
    const values = [];
    if (start) {
        if (/^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(existing.end) && start >= existing.end) {
            const e = new Error('InvalidTimeRange');
            e.code = 'INVALID_TIME_RANGE';
            throw e;
        }
        sets.push('StartTime = ?');
        values.push(start);
    }
    if (end) {
        const curStart = start || existing.start;
        if (/^\d{2}:\d{2}$/.test(end) && /^\d{2}:\d{2}$/.test(curStart) && curStart >= end) {
            const e = new Error('InvalidTimeRange');
            e.code = 'INVALID_TIME_RANGE';
            throw e;
        }
        sets.push('EndTime = ?');
        values.push(end);
    }
    if (day) {
        sets.push('TeachingDay = ?');
        values.push(day);
    }
    if (typeof method === 'string') {
        sets.push('method = ?');
        values.push(method);
    }

    if (sets.length === 0) return existing; 

    values.push(classId);
    const sql = `UPDATE Class SET ${sets.join(', ')} WHERE ClassID = ?`;
    await dbPool.execute(sql, values);
    return await getClassById(classId);
}

export async function deleteClass(classId, tutorId) {
    const existing = await getClassById(classId);
    if (!existing) return false;
    if (String(existing.tutorId) !== String(tutorId)) {
        const e = new Error('NotOwner');
        e.code = 'NOT_OWNER';
        throw e;
    }
    const [result] = await dbPool.execute('DELETE FROM Class WHERE ClassID = ?', [classId]);
    return result.affectedRows > 0;
}

export async function getClassesByTutorId(tutorId) {
    const [rows] = await dbPool.execute(
        'SELECT ClassID, TutorID, StartTime, EndTime, TeachingDay, method FROM Class WHERE TutorID = ?',
        [tutorId]
    );
    if (!rows || rows.length === 0) return [];
    return rows.map((r) => ({
        id: r.ClassID,
        tutorId: String(r.TutorID),
        start: r.StartTime,
        end: r.EndTime,
        day: r.TeachingDay,
        method: r.method,
    }));
}

export async function deleteTutorCourseRegistration(userId, courseId) {
    const [result] = await dbPool.execute(
        'DELETE FROM `TutorCourseRegistration` WHERE UserID = ? AND CourseID = ? ', 
        [userId, courseId]
    ); 

    return result.affectedRows > 0;
}

export async function deleteMultipleTutorCourseRegistrations(userId, courseIds) {
    if (!courseIds || courseIds.length === 0) {
        return true;
    }
    
    const placeholders = courseIds.map(() => '?').join(',');
    const [result] = await dbPool.execute(
        `DELETE FROM \`TutorCourseRegistration\` WHERE UserID = ? AND CourseID IN (${placeholders})`, 
        [userId, ...courseIds]
    ); 

    return result.affectedRows > 0;
}