// You should create a .env file at the project root with a APP_SECRET env variable into it
import 'dotenv/config';
import '@babel/polyfill';

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

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

passport.use(new FacebookStrategy({
  clientID: process.env.FB_API_ID,
  clientSecret: process.env.FB_API_SECRET,
  callbackURL: 'http://localhost:3000/auth/facebook/callback',
},
((accessToken, refreshToken, profile, cb) => {
  console.log(profile.id);
})));

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: (request) => ({
    ...request,
    prisma,
  }),
});

server.get('/auth/facebook',
  passport.authenticate('facebook'));

server.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

server.start(() => console.log('Server is running on http://localhost:4000'));
