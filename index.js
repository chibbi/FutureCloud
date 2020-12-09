const app = require("express")();
const http = require("http").createServer(app);
const fs = require("fs");

let httpport = 3000;

const log = require("./logging")(5);
log.printlog("Loaded logging: " + "5", 5);

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', 'Rainbows')
    next()
})

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
/* ROUTING */
app.get('/', function (req, res) {
    if (req.cookies.user == "undefined" || req.cookies.pw == "undefined") {
        log.log("Unkown User: " + JSON.stringify(req.cookies), 5);
        res.sendFile(__dirname + "/static/login.html");
    } else {
        var loggedin = false;
        var usersJsonFile;
        fs.readFile(__dirname + "/userDB/users.json", "utf8", (data,err) => {
            if (err) throw err;
            usersJsonFile = data;
        });
        log.log(usersJsonFile,5);
        if (loggedin) {
            log.log("Known User: " + req.cookies.user, 5);
            res.sendFile(__dirname + "/static/home.html");
        }
    }

})

/* SERVERSTART */

http.listen(httpport, () => {
    log.log("Listening on Port: " + httpport, 4);
});
