// reference
// https://github.com/danielfsousa/express-rest-es2017-boilerplate
// 
const config = require('./vars');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const logs = config.logs;
const error = require('./../middleware/error');
const routesV1 = require('./../routes/v1');

const app = express();

// request logging. dev: console | production: file
app.use(morgan(logs));

// parse body params and attach them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.use('/v1', routesV1);

app.use(error.notFound);
app.use(error.errorHandler);

module.exports = app;
