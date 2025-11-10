import dbPool from '../database.js';

export async function getCourse() {
    const [rows] = await dbPool.execute('SELECT Cid as id, Cname as name, Faculty as faculty FROM `Course`'); 
    return rows;
}

export async function enrollCourse (userid, courseid) {
    const [rows] = await dbPool.execute('INSERT INTO `CourseRegistration` (UserID, CourseID) VALUES (?, ?)', [userid, courseid]) 
    return rows;
} 