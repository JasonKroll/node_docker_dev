// reference
// https://github.com/danielfsousa/express-rest-es2017-boilerplate
// 
Promise = require("bluebird");
const config = require('./config/vars');
const port = config.port;
const app = require('./config/express');
const mongoose = require('./config/mongoose');

// open mongoose connection
mongoose.connect();

// listen
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

module.exports = app;