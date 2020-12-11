const { json } = require("express");

module.exports = function (app) {
    const fs = require("fs");
    const multer = require('multer');
    const log = require("./logging")();

    let sessions = [];
    /*
    TODO: TRY THAT IF still not working
    const multerConfig = {
      storage : multer.diskStorage({
        destination: function (req, file, next) {
          next(null, __dirname + "/public/")
        },
        filename: function (req, file, next) {
      
          let imageId = encryption.generateId();
          let imageNameWithId = imageId.substr(0,10);
          imagesNames.push({name:imageNameWithId,id:imageId});
          let fileName = "" + imageNameWithId + "_" + file.originalname;
      
          next(null, fileName)
        }
      })
    };
    
    */
    const multerConfig = {
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, __dirname + "/public/")
            },
            filename: function (req, file, cb) {
                var [loggedin, user] = isLoggedIn(req.cookies.session);
                if (loggedin) {
                    var usersJson = JSON.parse(fs.readFileSync(__dirname + "/userDB/" + user + ".json", "utf8"));
                    var fileArt = file.originalname.split(".");
                    fileArt = fileArt[fileArt.length - 1];
                    var fileCustomName = createFileName() + "." + fileArt;
                    var path = __dirname + "/public/" + fileCustomName;
                    console.log(req.body);
                    if (req.body.fileName != undefined && req.body.fileName != "") {
                        var newFile = { "name": req.body.fileName, "path": "/" + fileCustomName, "owner": user };
                    } else {
                        var newFile = { "name": file.originalname, "path": path, "owner": user };
                    }
                    usersJson[Object.keys(usersJson).length] = newFile;
                    fs.writeFileSync(__dirname + "/userDB/" + user + ".json", Buffer.from(JSON.stringify(usersJson), "utf8"));
                    return cb(null, fileCustomName);
                } else {
                    return cb(new Error('Not Logged in'));
                }
            }
        })
    };
    const upload = multer({ storage: multerConfig.storage })

    app.get('/', function (req, res) {
        if (req.cookies.session == undefined) {
            res.redirect("/login");
        }
        var [loggedin, user] = isLoggedIn(req.cookies.session);
        if (loggedin) {
            res.redirect("/home");
        } else {
            res.redirect("/login");
        }
    })

    app.get('/login', function (req, res) {
        if (req.cookies.session == undefined) {
            res.sendFile(__dirname + "/static/login.html");
        }
        var [loggedin, user] = isLoggedIn(req.cookies.session);
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
        if (req.cookies.session == undefined) {
            res.redirect("/login");
        }
        var [loggedin, user] = isLoggedIn(req.cookies.session);
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
        var [loggedin, user] = isLoggedIn(req.cookies.session);
        if (loggedin) {
            if (fs.existsSync(__dirname + "/userDB/" + user + ".json")) {
                var usersDb = fs.readFileSync(__dirname + "/userDB/" + user + ".json") + ";" + user;
                res.json(usersDb);
            } else {
                fs.writeFileSync(__dirname + "/userDB/" + user + ".json", Buffer.from('{' +
                    '"0":{"name":"a great gif","path":"/test.gif","owner":"' + user + '"},' +
                    '"1":{"name":"Nonexistent File","path":"/test.txt","owner":"' + user + '"}}', "utf8"));
                var usersDb = fs.readFileSync(__dirname + "/userDB/" + user + ".json") + ";" + user;
                res.json(usersDb);
            }
        } else {
            res.redirect("/login");
        }
    })

    app.get("/favicon.ico", (req, res) => {
        res.sendFile(__dirname + "/static/pictures/schoki-logo.png");
    });

    app.post('/download', upload.single("fileupload"), function (req, res) {
        if (req.cookies.session == undefined) {
            res.redirect("/login");
        }
        var [loggedin, user] = isLoggedIn(req.cookies.session);
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
        var [loggedin, user] = isLoggedIn(req.cookies.session);
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
            res.redirect("/login");
        }
    })

    app.delete('/download/:file', function (req, res) {
        console.log("DELETE REQUESSTT");
        if (req.cookies.session == undefined) {
            res.redirect("/login");
        }
        var [loggedin, user] = isLoggedIn(req.cookies.session);
        var usersJson = JSON.parse(fs.readFileSync(__dirname + "/userDB/" + user + ".json", "utf8"));
        for (var i = 0; i < Object.keys(usersJson).length; i++) {
            var element = usersJson[i];
            if (req.params.file == element.path.replace("/", "")) {
                loggedin = true;
            }
        }
        if (loggedin) {
            if (!fs.existsSync(__dirname + "/public/" + req.params.file)) {
                delFile("/" + req.params.file,user);
                log.log(user + " deleted nonexistent /public/" + req.params.file ,1);
                res.redirect("/home");
            } else {
                fs.rmSync(__dirname + "/public/" + req.params.file);
                delFile("/" + req.params.file,user);
                log.log(user + " deleted /public/" + req.params.file ,3);
                res.redirect("/home");
            }
        } else {
            res.redirect("/login");
        }
    })

    //TODO: Create put request for uploading files => Cloud finished xD
    //      every file has property "owner" for deletion you have to be owner

    /* MISSELANIOUS */
    function createSession(user) {
        var exists = true;
        var num;
        while (exists) {
            num = Math.floor(Math.random() * 1E18);
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

    function isLoggedIn(session) {
        for (var i = 0; i < sessions.length; i++) {
            if (session == sessions[i].num) {
                user = sessions[i].user;
                return [true, sessions[i].user];
            }
        }
        return [false, ""];
    }

    /* STORAGE */
    function delFile(file,user) {
        var usersJson = JSON.parse(fs.readFileSync(__dirname + "/userDB/" + user + ".json", "utf8"));
        console.log(usersJson);
        for (const [key, value] of Object.entries(usersJson)) {
            if(value.path == file) {
                console.log("PPPPP " + usersJson[key]);
                delete usersJson[key];
                console.log(usersJson);
            }
          }
        fs.writeFileSync(__dirname + "/userDB/" + user + ".json", Buffer.from(JSON.stringify(usersJson), "utf8"));
    }
    function createFileName() {
        var exists = true;
        var num;
        var dir = fs.readdirSync(__dirname + "/public");
        var allexisting = [];
        for (var i = 0; i < dir.length; i++) {
            var name = dir[i].split(".");
            name = name[0];
            allexisting.push(name);
        }
        while (exists) {
            num = Math.floor(Math.random() * 1000000000000000000);
            for (var i = 0; i < allexisting.length; i++) {
                if (num == allexisting[i].num) {
                    exists = true;
                } else { exists = false }
            }
        }
        return num;
    }
    return module;
}
