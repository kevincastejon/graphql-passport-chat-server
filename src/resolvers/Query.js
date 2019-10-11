const { getUserId } = require('../utils');

function users(parent, args, context) {
  getUserId(context);
  return context.prisma.users({
    skip: args.skip,
    first: args.first,
    orderBy: 'name_ASC',
  });
}

async function feed(parent, args, context) {
  getUserId(context);
  const count = await context.prisma
    .messagesConnection()
    .aggregate()
    .count();
  const messages = await context.prisma.messages({
    skip: args.skip,
    first: args.first,
    orderBy: 'createdAt_DESC',
  });
  return { count, messages };
}

module.exports = {
  users, feed,
};
