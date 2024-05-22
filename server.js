const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { typeDefs, resolvers } = require('./schema');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function startServer() {
  const app = express();

  const schema = makeExecutableSchema({ typeDefs, resolvers: resolvers(prisma) });
  const apolloServer = new ApolloServer({
    schema,
    context: { prisma },
    introspection: true
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.get('/', (req, res) => {
    res.send({ hello: 'world' });
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`);
  });
}

startServer();
