module.exports = function (app) {
    const fs = require("fs");
    const multer = require('multer');
    const log = require("./logging")();
    const cloud = require("./cloud")();

    const multerConfig = cloud.multer(multer);
    const upload = multer({ storage: multerConfig.storage })

    app.get("/favicon.ico", (req, res) => {
        res.sendFile(__dirname + "/static/pictures/schoki-logo.png");
    });
    app.get("/js/default.js", (req, res) => {
        res.sendFile(__dirname + "/static/js/default.js");
    });
    app.get("/css/default.css", (req, res) => {
        res.sendFile(__dirname + "/static/css/default.css");
    });

    app.get('/', function (req, res) {
        res.redirect("/login");
    })

    app.get('/login', function (req, res) {
        if (req.cookies.session == undefined) {
            res.sendFile(__dirname + "/static/login.html");
        }
        var [loggedin, user] = cloud.isLoggedIn(req.cookies.session);
        if (loggedin) {
            res.redirect("/home");
        } else {
            res.sendFile(__dirname + "/static/login.html");
        }
    })

    app.post('/login', upload.none(), function (req, res) {
        var loggedin = false;
        var user = req.body.title;
        var userpw = req.body.text;
        if (user == undefined || userpw == undefined) {
            res.sendFile(__dirname + "/static/login.html");
        } else {
            // TODO: hash those password
            var usersJsonFile = JSON.parse(fs.readFileSync(__dirname + "/userDB/users.json", "utf8"));
            for (var i = 0; i < Object.keys(usersJsonFile).length; i++) {
                var element = usersJsonFile[i];
                if (user == element.name && userpw == element.password) {
                    loggedin = true;
                    log.log(user, 4);
                }
            }
            if (loggedin) {
                res.cookie('session', cloud.createSession(user), {});
                setTimeout(() => { }, 100);
                res.redirect("/home");
            } else {
                //res.send(JSON.stringify(req));
                res.sendFile(__dirname + "/static/login.html");
            }
        }
    })

    app.get('/home', function (req, res) {
        if (req.cookies.session == undefined) {
            res.redirect("/login");
        }
        var [loggedin, user] = cloud.isLoggedIn(req.cookies.session);
        if (loggedin) {
            res.sendFile(__dirname + "/static/home.html");
        } else {
            res.redirect("/login");
        }
    })

    app.get('/api', function (req, res) {
        if (req.cookies.session == undefined) {
            res.redirect("/login");
        }
        var [loggedin, user] = cloud.isLoggedIn(req.cookies.session);
        if (loggedin) {
            if (fs.existsSync(__dirname + "/userDB/" + user + ".json")) {
                var usersDb = fs.readFileSync(__dirname + "/userDB/" + user + ".json") + ";" + user;
                res.json(usersDb);
            } else {
                fs.writeFileSync(__dirname + "/userDB/" + user + ".json", Buffer.from('{' +
                    '"0":{"name":"a great gif","path":"/test.gif","owner":"admin","share":"' + user + '"},' +
                    '"1":{"name":"Nonexistent File","path":"/test.txt","owner":"admin","share":"' + user + '"}}', "utf8"));
                var usersDb = fs.readFileSync(__dirname + "/userDB/" + user + ".json") + ";" + user;
                res.json(usersDb);
            }
        } else {
            res.redirect("/login");
        }
    })

    app.post('/download', upload.single("fileupload"), function (req, res) {
        if (req.cookies.session == undefined) {
            res.redirect("/login");
        }
        var [loggedin, user] = cloud.isLoggedIn(req.cookies.session);
        if (loggedin) {
            res.redirect("/home");
        } else {
            res.redirect("/login");
        }
    })

    app.get('/download/:file', function (req, res) {
        if (req.cookies.session == undefined) {
            res.redirect("/login");

        }
        var [loggedin, user] = cloud.isLoggedIn(req.cookies.session);
        if (loggedin) {
            if (!fs.existsSync(__dirname + "/public/" + req.params.file)) {
                log.log(user + " WANTED: " + req.params.file, 5);
                res.sendFile(__dirname + "/public/didnotexistdefaultfile45437589043234778.txt");
            } else {
                log.printlog(user + " DOWNLOADED: " + req.params.file, 3);
                res.sendFile(__dirname + "/public/" + req.params.file);
            }
        } else {
            res.redirect("/login");
        }
    })

    // TODO: Make this stuff here work
    app.put('/download/:file', function (req, res) {
        if (req.cookies.session == undefined) {
            res.redirect("/login");
        }
        var [loggedin, user] = cloud.isLoggedIn(req.cookies.session);
        var owns = false;
        var usersJson = JSON.parse(fs.readFileSync(__dirname + "/userDB/" + user + ".json", "utf8"));
        for (var i = 0; i < Object.keys(usersJson).length; i++) {
            var element = usersJson[i];
            if (user == element.owner) {
                owns = true;
            }
        }
        if (loggedin) {
            if (!fs.existsSync(__dirname + "/public/" + req.params.file)) {
                cloud.delFile("/" + req.params.file, user);
                log.log(user + " deleted nonexistent /public/" + req.params.file, 1);
                res.redirect("/home");
            } else {
                if (owns) {
                    console.log(req.body.others);
                    log.log(user + " shared /public/" + req.params.file + " with " + req.body.others, 3);
                }
                res.redirect("/home");
            }
        } else {
            res.redirect("/login");
        }
    })

    app.delete('/download/:file', function (req, res) {
        if (req.cookies.session == undefined) {
            res.redirect("/login");
        }
        var [loggedin, user] = cloud.isLoggedIn(req.cookies.session);
        var owns = false;
        var usersJson = JSON.parse(fs.readFileSync(__dirname + "/userDB/" + user + ".json", "utf8"));
        for (var i = 0; i < Object.keys(usersJson).length; i++) {
            var element = usersJson[i];
            if (user == element.owner) {
                owns = true;
            }
        }
        if (loggedin) {
            if (!fs.existsSync(__dirname + "/public/" + req.params.file)) {
                cloud.delFile("/" + req.params.file, user);
                log.log(user + " deleted nonexistent /public/" + req.params.file, 1);
                res.redirect("/home");
            } else {
                if (owns) {
                    fs.rm(__dirname + "/public/" + req.params.file, (err) => {
                        if (err) throw err;
                    });
                }
                cloud.delFile("/" + req.params.file, user);
                log.log(user + " deleted /public/" + req.params.file, 3);
                res.redirect("/home");
            }
        } else {
            res.redirect("/login");
        }
    })
    return module;
}