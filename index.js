const app = require('express')();
const fs = require("fs");
const httpport = 3000;

const log = require("./logging");
log.log("Loaded logging: " + "5", 5);

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', 'Rainbows')
    next()
});

/* ROUTER */
require("./router")(app);

/* SERVERSTART */
app.listen(httpport);
log.log("HttpServer has started on Port " + httpport, 5);