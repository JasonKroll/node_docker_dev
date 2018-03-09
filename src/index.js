// reference
// https://github.com/danielfsousa/express-rest-es2017-boilerplate
// 
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 3000;
const logs = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
const error = require('./middleware/error');
const routes = require('./routes');

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


// app.use('/health_check', (req, res, next) => {
//     res.jsonp({status: 'ok'})
// });
app.use('/', routes);

app.use(error.notFound);
app.use(error.errorHandler);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
