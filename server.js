// server.js
const Fastify = require('fastify');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const fastifyExpress = require('fastify-express');
const { typeDefs, resolvers } = require('./schema');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function startServer() {
  const app = Fastify();

  await app.register(fastifyExpress);

  const schema = makeExecutableSchema({ typeDefs, resolvers: resolvers(prisma) });
  const apolloServer = new ApolloServer({ schema });

  await apolloServer.start();

  const expressApp = express();
  apolloServer.applyMiddleware({ app: expressApp });

  app.use(expressApp);

  app.get('/', async (request, reply) => {
    reply.send({ hello: 'world' });
  });

  const port = process.env.PORT || 4000;
  app.listen({ port }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`🚀 Server ready at ${address}/graphql`);
  });
}

startServer();
