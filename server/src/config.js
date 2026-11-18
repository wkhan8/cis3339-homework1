const path = require('node:path');
const dotenv = require('dotenv');

const rootDir = path.resolve(__dirname, '../..');
const envPath = path.join(rootDir, '.env');
const result = dotenv.config({ path: envPath });

const parsedPort = Number.parseInt(process.env.PORT, 10);

module.exports = {
  rootDir,
  envPath,
  dotenvLoaded: !result.error,
  isProduction: process.env.NODE_ENV === 'production',
  port: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3000,
  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/cis3339_homework1',
  clientDistDir: path.join(rootDir, 'client', 'dist'),
};
