
# API Gateway with Rate Limiting and Load Balancing

This project implements an API gateway using Express.js with rate limiting and load balancing features.

## Overview

The API gateway is designed to:
- Limit the number of requests a client can make to prevent abuse.
- Log incoming requests for monitoring and debugging.
- Distribute incoming requests across multiple backend services for load balancing.

## Dependencies

The project uses the following npm packages:
- `express`: A web framework for Node.js.
- `http`: Node.js module for creating an HTTP server.
- `express-rate-limit`: Middleware for rate limiting.
- `morgan`: HTTP request logger middleware.
- `http-proxy`: A library to proxy HTTP requests.

## Code Explanation

### Initialization and Middleware

```javascript
const express = require('express');
const http = require('http');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const httpProxy = require('http-proxy');
```
- **Dependencies**: Imports necessary libraries for creating the server, rate limiting, logging, and proxying requests.

```javascript
const app = express();
const gatewayPort = 3000;
```
- **Express App**: Initializes the Express app and sets the port for the API gateway.

### Rate Limiting

```javascript
const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Maximum 10 requests per minute
    message: 'Rate limit exceeded. Please try again later.',
});
app.use(rateLimiter);
```
- **Rate Limiting Middleware**: Configures and applies rate limiting to restrict each client to 10 requests per minute.

### Logging

```javascript
app.use(morgan('combined'));
```
- **Logging Middleware**: Uses `morgan` to log details of each incoming request in a combined format.

### Root Route

```javascript
app.get('/', (req, res) => {
    res.send('Welcome to the API Gateway');
});
```
- **Root Route**: Defines a simple route that responds with a welcome message.

### Load Balancing

```javascript
const proxy = httpProxy.createProxyServer();
const backendServices = [
    { target: 'http://localhost:3001' }, // Service 1
    { target: 'http://localhost:3002' }, // Service 2
    { target: 'http://localhost:3003' }, // Service 3
];
```
- **HTTP Proxy and Backend Services**: Initializes the proxy server and defines a list of backend services to distribute requests among.

```javascript
app.use('/service*', (req, res) => {
    const { url } = req;
    const selectedService = backendServices[Math.floor(Math.random() * backendServices.length)];
    console.log(selectedService);
    proxy.web(req, res, { target: selectedService.target + url });
});
```
- **Load Balancing Middleware**: Randomly selects one of the backend services and forwards the request to it.

### Backend Services

```javascript
http.createServer((req, res) => {
    res.end('Service 1 response');
}).listen(3001);

http.createServer((req, res) => {
    res.end('Service 2 response');
}).listen(3002);

http.createServer((req, res) => {
    res.end('Service 3 response');
}).listen(3003);
```
- **Mock Backend Services**: Creates three simple HTTP servers that respond with a message, each running on a different port.

### Start API Gateway

```javascript
const gatewayServer = http.createServer(app);
gatewayServer.listen(gatewayPort, () => {
    console.log(`API Gateway is running on http://localhost:${gatewayPort}`);
});
```
- **Start Server**: Creates and starts the HTTP server for the API gateway on port 3000, logging a message to the console.

## How to Run

1. Ensure you have Node.js installed.
2. Install the necessary packages:
   ```sh
   npm install express express-rate-limit morgan http-proxy
   ```
3. Run the server:
   ```sh
   node your_filename.js
   ```
4. The API gateway will be running at `http://localhost:3000`.

## Purpose

This API gateway setup provides:
- **Rate Limiting**: Prevents abuse by limiting requests per client.
- **Logging**: Monitors and logs incoming requests.
- **Load Balancing**: Distributes requests evenly across multiple backend services for better performance and reliability.
