const { json } = require("express");

module.exports = function (app) {
    const fs = require("fs");
    const multer = require('multer');
    const log = require("./logging")();

    let sessions = [];

    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/')
        },
        filename: (req, file, cb) => {
            var loggedin = false;
            var user;
            for (var i = 0; i < sessions.length; i++) {
                if (req.cookies.session == sessions[i].num) {
                    loggedin = true;
                    user = sessions[i].user;
                    break;
                }
            }
            if (loggedin) {
                var usersJson = JSON.parse(fs.readFileSync(__dirname + "/userDB/" + user + ".json", "utf8"));
                console.log(req.file);
                var fileArt = req.file.split(".");
                fileArt = fileArt[fileArt.length - 1];
                var path = createFile() + "." + fileArt;
                var newFile = { "name": req.body.fileName, "path": path, "owner": user };
                usersJson[Object.keys(usersJson).length] = newFile;
                fs.writeFileSync(__dirname + "/userDB/" + user + ".json", Buffer.from(JSON.stringify(usersJson), "utf8"));
            }
            cb(null, new Date().toISOString() + "-" + file.originalname);
          }
    })

    const upload = multer({ storage: storage })

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
        var loggedin = false;
        if (req.cookies.session == "undefined") {
            res.sendFile(__dirname + "/static/login.html");

        }
        for (var i = 0; i < sessions.length; i++) {
            if (req.cookies.session == sessions[i]) {
                loggedin = true;
            }
        }
        if (loggedin) {
            res.redirect("/home");

        } else {
            res.sendFile(__dirname + "/static/login.html");
        }
    })

    app.post('/login', function (req, res) {
        var loggedin = false;
        var user = req.body.title;
        var userpw = req.body.text;
        if (user == "undefined" || userpw == "undefined") {
            res.sendFile(__dirname + "/static/login.html");

        } else {
            // TODO: hash those password
            var usersJsonFile = JSON.parse(fs.readFileSync(__dirname + "/userDB/users.json", "utf8"));
            for (var i = 0; i < Object.keys(usersJsonFile).length; i++) {
                var element = usersJsonFile[i];
                //console.log(user);
                //console.log(userpw);
                if (user == element.name && userpw == element.password) {
                    loggedin = true;
                    console.log(user);
                }
            }
            if (loggedin) {
                res.cookie('session', createSession(user), {});
                setTimeout(() => { }, 100);
                res.redirect("/home");

            } else {
                //res.send(JSON.stringify(req));
                res.sendFile(__dirname + "/static/login.html");

            }
        }
    })

    app.get('/home', function (req, res) {
        var loggedin = false;
        var user;
        if (req.cookies.session == "undefined") {
            res.redirect("/login");

        }
        for (var i = 0; i < sessions.length; i++) {
            if (req.cookies.session == sessions[i].num) {
                loggedin = true;
                user = sessions[i].user;
                break;
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
        var user;
        if (req.cookies.session == "undefined") {
            res.status(404).send("Not logged in");
        }
        for (var i = 0; i < sessions.length; i++) {
            if (req.cookies.session == sessions[i].num) {
                loggedin = true;
                user = sessions[i].user;
                break;
            }
        }
        if (loggedin) {
            if (fs.existsSync(__dirname + "/userDB/" + user + ".json")) {
                res.sendFile(__dirname + "/userDB/" + user + ".json");
            } else {
                fs.writeFileSync(__dirname + "/userDB/" + user + ".json", Buffer.from('{' +
                    '"0":{"name":"a great gif","path":"/test.gif","owner":"' + user + '"},' +
                    '"1":{"name":"Nonexistent File","path":"/test.txt","owner":"' + user + '"}}', "utf8"));
                res.sendFile(__dirname + "/userDB/" + user + ".json");
            }
        } else {
            res.status(404).send("Not logged in");
        }
    })

    app.get("/favicon.ico", (req, res) => {
        res.sendFile(__dirname + "/static/pictures/schoki-logo.png");
    });

    app.post('/download', upload.single("fileupload"), function (req, res) {
        var loggedin = false;
        var user;
        console.log(req.body);
        if (req.cookies.session == "undefined") {
            res.redirect("/login");
        }
        for (var i = 0; i < sessions.length; i++) {
            if (req.cookies.session == sessions[i].num) {
                loggedin = true;
                user = sessions[i].user;
                break;
            }
        }
        if (loggedin) {
            res.redirect("/home");
        } else {
            res.redirect("/login");
        }
    })

    app.get('/download/:file', function (req, res) {
        var loggedin = false;
        var user;
        if (req.cookies.session == "undefined") {
            res.status(404).send("Not logged in");

        }
        for (var i = 0; i < sessions.length; i++) {
            if (req.cookies.session == sessions[i].num) {
                loggedin = true;
                user = sessions[i].user;
                break;
            }
        }
        var usersJson = JSON.parse(fs.readFileSync(__dirname + "/userDB/" + user + ".json", "utf8"));
        for (var i = 0; i < Object.keys(usersJson).length; i++) {
            var element = usersJson[i];
            if (req.params.file == element.path.replace("/", "")) {
                loggedin = true;
            }
        }
        if (loggedin) {
            console.log(__dirname + "/public/" + req.params.file);
            if (!fs.existsSync(__dirname + "/public/" + req.params.file)) {
                res.sendFile(__dirname + "/public/didnotexistdefaultfile45437589043234778.txt");
            } else {
                log.log("ASKING FILE: " + req.params.file, 5);
                res.sendFile(__dirname + "/public/" + req.params.file);
            }
        } else {
            res.status(404).send("Not logged in");
        }
    })

    app.delete('/download/:file', function (req, res) {
        var loggedin = false;
        var user;
        if (req.cookies.session == "undefined") {
            res.status(404).send("Not logged in");
        }
        for (var i = 0; i < sessions.length; i++) {
            if (req.cookies.session == sessions[i].num) {
                loggedin = true;
                user = sessions[i].user;
                break;
            }
        }
        var usersJson = JSON.parse(fs.readFileSync(__dirname + "/userDB/" + user + ".json", "utf8"));
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
            res.status(404).send("Not logged in");
        }
    })

    //TODO: Create put request for uploading files => Cloud finished xD
    //      every file has property "owner" for deletion you have to be owner

    /* MISSELANIOUS */
    function createSession(user) {
        var exists = true;
        var num;
        while (exists) {
            num = Math.floor(Math.random() * 1000000000000000000);
            for (var i = 0; i < sessions.length; i++) {
                if (num == sessions[i].num) {
                    exists = true;
                }
            }
            sessions.push({ num, user });
            break;
        }
        return num;
    }

    /* STORAGE */
    function createFile() {
        var exists = true;
        var num;
        var allexisting = [];
        fs.readdir(__dirname + "/public", (err, files) => {
            files.forEach(file => {
                var name = file.split(".");
                name = file[file.length - 1];
                allexisting.push(name);
            });
        });

        while (exists) {
            num = Math.floor(Math.random() * 1000000000000000000);
            for (var i = 0; i < allexisting.length; i++) {
                if (num == allexisting[i].num) {
                    exists = true;
                }
            }
            allexisting.push(num);
            break;
        }
        return __dirname + "/" + num;
    }
    return module;
}