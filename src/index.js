// You should create a .env file at the project root with a APP_SECRET env variable into it
import 'dotenv/config';
import '@babel/polyfill';

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
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

passport.use(new FacebookStrategy({
  clientID: process.env.FB_API_ID,
  clientSecret: process.env.FB_API_SECRET,
  callbackURL: 'http://localhost:4000/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'picture.type(small)'],
},
async (accessToken, refreshToken, profile, cb) => {
  let users;
  try {
    users = await prisma.users({ where: { facebookid: profile.facebookid } });
    if (users.length > 0) {
      cb(null, users[0]);
    } else {
      const newUser = await prisma.createUser({
        name: profile.displayName,
        facebookid: profile.id,
        avatar: profile.photos[0].value,
      });
      cb(null, newUser);
    }
  } catch (e) {
    console.log(e);
  }
}));

// used to serialize the user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(async (id, done) => {
  done(null, await prisma.users({ where: { facebookid: id } })[0]);
});
// server.use(passport.initialize());
server.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

server.use(passport.initialize());
server.use(passport.session());
server.get('/auth/facebook',
  passport.authenticate('facebook'));

server.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: 'http://localhost:3000/#/fail' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.clearCookie('connect.sid', { path: '/' });
    res.redirect(`http://localhost:3000/#/success/${jwt.sign({ userId: res.req.user.id }, process.env.APP_SECRET)}`);
  });

server.start(() => console.log('Server is running on http://localhost:4000'));
