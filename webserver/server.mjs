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

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

async function start() {
    try {
        try {
            const [rows] = await dbPool.query("SELECT 1 AS ok");
            console.log("Database connected:", rows[0]);
        } catch (err) {
            console.error("Database connecting error:", err.message || err);
            process.exit(1);
        }

        await server.start();

        app.use('/graphql', cors(), bodyParser.json(), expressMiddleware(server));
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