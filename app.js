const express = require('express');
const http = require('http');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const httpProxy = require('http-proxy');

//server setup
const app = express();
const port = 3000;

//rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 10, // Limit to 10 request per minute
    message: 'Rate limit exceeded. Please try again later',
});

//Apply rate limiting to all request
app.use(limiter);

//Login middleware
app.use(morgan('combined'));

//define your routes
app.get('/', (req, res) => {
    res.send('Welcome to the gateway');
})

//create a proxy to handle load balancing
const proxy = httpProxy.createProxyServer();

//load balancing setup
const services = [
    {target: 'http://localhost:3001'}, //service1
    {target: 'http://localhost:3002'}, //service2
    {target: 'http://localhost:3003'}, //service3
];

//Load balancing middleware
app.use('/service*', (req, res) => {
    const {url} = req;
    const selectedService = services[Math.floor(Math.random() * services.length)];
    console.log(selectedService);
    proxy.web(req, res, {target: selectedService.target + url});
});

//create seperate instances for backend services
http.createServer((req, res) => {
    res.end('service 1 response');
}).listen(3001);
http.createServer((req, res) => {
    res.end('service 2 response');
}).listen(3002);
http.createServer((req, res) => {
    res.end('service 3 response');
}).listen(3003);

//start the gateway
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Edge gateway is running on http://localhost:${port}`);
});

