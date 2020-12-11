const express = require('express');
const app = express();
const http = require("http").createServer(app);
const fs = require("fs");

const httpport = 3000;

const log = require("./logging")();
log.log("Loaded logging: " + "5", 5);

const cookieParser = require('cookie-parser');
const morgan = require("morgan");
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(cookieParser());
app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', 'Rainbows')
    next()
});



// used to create a temp database for testing
/*
var users = {};
for(var i = 0;i<= 100;i++) {
    var user = {"name":"Kevin","password":"Foo"};
    users[i] = user;
}
log.log(JSON.stringify(users) + "\n\n",5);
fs.writeFileSync("userDB/users.json",JSON.stringify(users), "utf8");
*/

/* ROUTER */
require("./router")(app);
/* SERVERSTART */

http.listen(httpport, () => {
    log.log("Listening on Port: " + httpport, 4);
});
