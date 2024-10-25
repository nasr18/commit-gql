import { ApolloServer } from '@apollo/server';
import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';

import { doConnect } from './config/db.config.js';
import { typeDefs } from './typedef/index.js';
import { employeeResolvers } from './employee/employee.resolver.js';
import { payrollResolvers } from './payroll/payroll.resolver.js';

await doConnect();

const resolvers = {
  Query: {
    greetings: () => 'Assalamu Alaikum',
    welcome: (_, args) => `Welcome ${args.name}`,
    ...employeeResolvers.Query,
    ...payrollResolvers.Query,
  },
  Employee: employeeResolvers.Employee,
  Payroll: payrollResolvers.Payroll,
};

const app = express();
const httpServer = createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  formatError: (err) => err.message,
});
await server.start();

app.use(cors(), express.json(), expressMiddleware(server));

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000`);
