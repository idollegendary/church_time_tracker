const dotenv = require('dotenv');
dotenv.config();

// Export Express app as Vercel function handler.
// Vercel's Node runtime will call this exported function for incoming requests.
const app = require('../src/app');

module.exports = (req, res) => app(req, res);
