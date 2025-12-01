
import { ApolloServer } from '@apollo/server';
import express from 'express';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import bodyParser from 'body-parser';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import dbPool from './database.js';
import { resolvers } from './resolvers/index.js';
import { typeDefs } from './schemas/index.js'
import jwt from 'jsonwebtoken';


dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});
const allowedOrigins = [
  "http://localhost:5173",  // Frontend chạy dưới máy (để test)
  "http://localhost:4000",  // Backend chạy dưới máy
  "https://mentor-link.onrender.com", // Link chính nó
  // Tạm thời bạn cứ deploy backend trước, lát có link frontend thì quay lại đây điền thêm vào
  "https://mentorlinkweb.onrender.com" 
];
async function start() {
    try {
        try {
            const [rows] = await dbPool.query("SELECT 1 AS ok");
            console.log("Database connected:", rows[0]);
        } catch (err) {
            console.error("Database connecting error:", err.message || err);
            console.warn("⚠️ Database not available - will use mock data");
        }

        await server.start();

        const authorizationJWT = async (req, res, next) => {
            const authorizationHeader = req.headers.authorization;
            if (!authorizationHeader) return next();

            const accessToken = authorizationHeader.split(' ')[1];

            try {
                const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
                res.locals.userId = decoded.id;
                next();
            } catch (err) {
                console.log({ err });
                if (err && err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED', expiredAt: err.expiredAt });
                }
                return res.status(403).json({ message: 'Forbidden', error: err });
            }
        };
        // Route trang chủ để test server sống hay chết
        app.get('/', (req, res) => {
            res.status(200).send("Server GraphQL Mentor Link đang chạy ngon lành!");
        });
        

        app.use(
            '/graphql',
            cors({
                origin: allowedOrigins, // Dùng danh sách ở trên
                credentials: true       // Cho phép gửi token/cookie
            }),
            authorizationJWT,
            bodyParser.json(),
            expressMiddleware(server, {
                context: async ({ req, res }) => {
                    return { userId: res.locals.userId };
                },
            })
        );

        await new Promise((resolve, reject) => {
            httpServer.listen(PORT, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        console.log(`Server:  http://localhost:${PORT}/graphql`);
    } catch (err) {
        console.log("server connecting error", err.message || err);
        process.exit(1);
    }
}

start();
