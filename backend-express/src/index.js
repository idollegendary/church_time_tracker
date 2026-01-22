const http = require('http');
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Trecker Time Express backend listening on port ${PORT}`);
});
