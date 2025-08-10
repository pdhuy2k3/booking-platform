// apps/backoffice-fe/healthcheck.js
const http = require('http');

const options = {
  host: process.env.NUXT_HOST || '0.0.0.0',
  port: process.env.NUXT_PORT || process.env.PORT || 3000,
  timeout: 2000,
  path: '/api/health'  // Health endpoint
};

const request = http.request(options, (res) => {
  console.log(`Health check STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('timeout', () => {
  console.log('Health check TIMEOUT');
  process.exit(1);
});

request.on('error', (err) => {
  console.log('Health check ERROR:', err.message);
  process.exit(1);
});

request.setTimeout(options.timeout);
request.end();
