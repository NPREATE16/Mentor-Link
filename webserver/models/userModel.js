import dbPool from '../database.js';

export async function findUserByEmail(email) {
  const [rows] = await dbPool.execute('SELECT * FROM User WHERE Email = ?', [email]);  
  return rows && rows.length ? rows[0] : null;
}

export async function findUserById(id) {
  const [rows] = await dbPool.execute('SELECT * FROM User WHERE UserId = ?', [id]);  
  return rows && rows.length ? rows[0] : null;
}

export async function createUser({ name, email, password, role }) {
  const [result] = await dbPool.execute(
    'INSERT INTO User (FullName, Email, Password, Role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  console.log('createduser', result);
  return result.insertId;
}

export async function _updateUser({ id, email, full_name, phone }) {
  const [result] = await dbPool.execute(
    `UPDATE User SET Email = ?, FullName = ?, Phone = ? WHERE UserId = ?`,
    [
      email ?? "",
      full_name ?? "-",
      phone ?? null, // undefined can't be used
      id
    ]
  );
  return result;
}
