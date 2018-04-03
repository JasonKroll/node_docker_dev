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
const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
    app.emit('apiStarted');
});

module.exports = app;
module.exports.server = server;