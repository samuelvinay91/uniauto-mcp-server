const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Server response:');
    console.log(data);
    
    try {
      const response = JSON.parse(data);
      if (response.status === 'ok') {
        console.log('UniAuto MCP Server is running successfully!');
      } else {
        console.log('Server is running but returned unexpected status.');
      }
    } catch (e) {
      console.log('Server response is not valid JSON.');
    }
  });
});

req.on('error', error => {
  console.error('Error connecting to server:', error.message);
  console.log('The UniAuto MCP Server does not appear to be running.');
});

req.end();