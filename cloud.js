module.exports = function () {
    const fs = require("fs");

    let sessions = [];

    module.multer = function (mult) {
        return {
            storage: mult.diskStorage({
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
                        if (req.body.fileName != undefined && req.body.fileName != "") {
                            var newFile = { "name": req.body.fileName, "path": "/" + fileCustomName, "owner": user, "share": "admin" };
                        } else {
                            var newFile = { "name": file.originalname, "path": "/" + fileCustomName, "owner": user, "share": "admin" };
                        }
                        usersJson[Object.keys(usersJson).length] = newFile;
                        fs.writeFileSync(__dirname + "/userDB/" + user + ".json", Buffer.from(JSON.stringify(usersJson), "utf8"));
                        return cb(null, fileCustomName);
                    } else {
                        return cb(new Error('Not Logged in'));
                    }
                }
            })
        }
    }

    module.delFile = function (file, user) {
        var usersJson = JSON.parse(fs.readFileSync(__dirname + "/userDB/" + user + ".json", "utf8"));
        console.log(usersJson);
        for (const [key, value] of Object.entries(usersJson)) {
            if (value.path == file) {
                delete usersJson[key];
            }
        }
        fs.writeFileSync(__dirname + "/userDB/" + user + ".json", Buffer.from(JSON.stringify(usersJson), "utf8"));
    }

    module.createSession = function(user) {
        var exists = true;
        var millsec = Date.now();
        var num;
        while (exists) {
            num = Math.floor(Math.random() * 1E18);
            for (var i = 0; i < sessions.length; i++) {
                if (num == sessions[i].num) {
                    exists = true;
                } // 1800000 == 30Minutes
                if (sessions[i].millsec >= 1800000) {
                    sessions.splice(i, 1);
                }
            }
            sessions.push({
                num,
                user,
                millsec
            });
            break;
        }
        return num;
    }

    module.isLoggedIn = function (session) {
        return isLoggedIn(session);
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
};
