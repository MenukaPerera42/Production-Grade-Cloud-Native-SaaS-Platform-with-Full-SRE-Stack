require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DB_URL || 'postgresql://user:password@localhost:5432/taskflow',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
};
