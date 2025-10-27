import mysql from "mysql2/promise";

const dbPool = mysql.createPool({
  host: "localhost",
  user: "root",         
  password: "root", 
  database: "BTL_CNPM", 
});

export default dbPool;