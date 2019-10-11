// You should create a .env file at the project root with a APP_SECRET env variable into it
import 'dotenv/config';
import '@babel/polyfill';

const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const Subscription = require('./resolvers/Subscription');
const Message = require('./resolvers/Message');
const User = require('./resolvers/User');

const resolvers = {
  Query,
  Mutation,
  Subscription,
  Message,
  User,
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: (request) => ({
    ...request,
    prisma,
  }),
});
server.start(() => console.log('Server is running on http://localhost:4000'));
