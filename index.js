const app = require("express")();
const http = require("http").createServer(app);
const fs = require("fs");

let httpport = 3000;
let sessions = [];

const log = require("./logging")(5);
log.log("Loaded logging: " + "5", 5);

const cookieParser = require('cookie-parser');
const morgan = require("morgan");
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
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
    var loggedin = false;
    if (req.cookies.session == "undefined") {
        res.redirect("/login");

    }
    for (var i = 0; i < sessions.length; i++) {
        if (req.cookies.session == sessions[i]) {
            loggedin = true;
        }
    }
    if (loggedin) {
        res.redirect("/home");

    } else {
        res.redirect("/login");

    }
})

app.get('/login', function (req, res) {
    var user = req.cookies.user;
    var userpw = req.cookies.pw;
    if (user == "undefined" || userpw == "undefined") {
        res.sendFile(__dirname + "/static/login.html");

    } else {
        var loggedin = false;
        // TODO: hash those password
        var usersJsonFile = JSON.parse(fs.readFileSync(__dirname + "/userDB/users.json", "utf8"));
        for (var i = 0; i < Object.keys(usersJsonFile).length; i++) {
            var element = usersJsonFile[i];
            if (user == element.name && userpw == element.password) {
                loggedin = true;
            }
        }
        if (loggedin) {
            res.cookie('session', createSession(), {});
            setTimeout(() => { }, 100);
            res.redirect("/home");

        } else {
            res.sendFile(__dirname + "/static/login.html");

        }
    }
})

app.get('/home', function (req, res) {
    var loggedin = false;
    if (req.cookies.session == "undefined") {
        res.redirect("/login");

    }
    for (var i = 0; i < sessions.length; i++) {
        if (req.cookies.session == sessions[i]) {
            loggedin = true;
        }
    }
    if (loggedin) {
        res.sendFile(__dirname + "/static/home.html");
    } else {
        res.redirect("/login");

    }
})

app.get('/api', function (req, res) {
    var loggedin = false;
    if (req.cookies.session == "undefined") {
        res.redirect("/login");

    }
    for (var i = 0; i < sessions.length; i++) {
        if (req.cookies.session == sessions[i]) {
            loggedin = true;
        }
    }
    if (loggedin) {
        res.sendFile(__dirname + "/userDB/" + req.cookies.user + ".json");
    } else {
        res.redirect("/login");

    }
})

app.get('/download/:file', function (req, res) {
    var loggedin = false;
    if (req.cookies.session == "undefined") {
        res.redirect("/login");

    }
    for (var i = 0; i < sessions.length; i++) {
        if (req.cookies.session == sessions[i]) {
            loggedin = true;
        }
    }
    var usersJson = JSON.parse(fs.readFileSync(__dirname + "/userDB/" + req.cookies.user + ".json", "utf8"));
    for (var i = 0; i < Object.keys(usersJson).length; i++) {
        var element = usersJson[i];
        if (req.params.file == element.path.replace("/", "")) {
            log.log("He OWNS", 3)
            loggedin = true;
        }
    }
    if (loggedin) {
        if (!fs.existsSync(__dirname + "/public/" + req.params.file)) {
            res.sendFile(__dirname + "/public/didnotexistdefaultfile45437589043234778.txt");
        } else {
            log.log("ASKING FILE: " + req.params.file, 5);
            res.sendFile(__dirname + "/public/" + req.params.file);
        }
    } else {
        res.redirect("/login");

    }
})

//TODO: Create put request for uploading files => Cloud finished xD

/* MISSELANIOUS */
function createSession() {
    var exists = true;
    var num;
    while (exists) {
        num = Math.floor(Math.random() * 1000000000000000000);
        for (var i = 0; i < sessions.length; i++) {
            if (num == sessions[i]) {
                exists = true;
            }
        }
        sessions.push(num);
        break;
    }
    log.log(num, 5);
    return num;
}

/* SERVERSTART */

http.listen(httpport, () => {
    log.log("Listening on Port: " + httpport, 4);
});
