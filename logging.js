const fs = require("fs");

const logging = 5;
// logging = 0 only Errors
// logging = 1 Errors and Alerts
// logging = 2 Errors, Alerts and Warnings                                // dont recommend going below 3
// logging = 3 Errors, Alerts, Warnings and infos (who uploaded ..)
// logging = 4 Errors, Alerts, Warnings and infos (who visited)
// logging = 5 Errors, Alerts, Warnings and infos (who visited) and debug

module.exports.log = function (text, logheight) {
    if (logheight == undefined) {
        console.log(addTimeStamp() + "\x1b[33m NOLOGDEFINED \x1b[33m - " + text + "\x1b[0m"); // everything yellow
    } else if (logging >= 0 && logheight == 0) {
        console.log(addTimeStamp() + "\x1b[31m ERROR \x1b[0m - " + text); // red
    } else if (logging >= 1 && logheight == 1) {
        console.log(addTimeStamp() + "\x1b[31m ALERT \x1b[0m - " + text); // red
    } else if (logging >= 2 && logheight == 2) {
        console.log(addTimeStamp() + "\x1b[33m  WARN \x1b[0m - " + text); // yellow
    } else if (logging >= 3 && logheight == 3) {
        console.log(addTimeStamp() + "\x1b[36m  INFO \x1b[0m - " + text); // cyan
    } else if (logging >= 4 && logheight == 4) {
        console.log(addTimeStamp() + "\x1b[36m  INFO \x1b[0m - " + text); // cyan
    } else if (logging >= 5 && logheight == 5) {
        console.log(addTimeStamp() + "\x1b[32m DEBUG \x1b[0m - " + text); // green
    }
};

module.exports.printlog = function (text, logheight) {
    if (logheight == undefined)
        console.log(addTimeStamp() + "\x1b[33m NOLOGDEFINED \x1b[33m - " + text + "\x1b[0m"); // everything yellow
    else if (logging >= 0 && logheight == 0)
        printevent(addTimeStamp() + "\x1b[31m ERROR \x1b[0m - " + text); // red
    else if (logging >= 1 && logheight == 1)
        printevent(addTimeStamp() + "\x1b[31m ALERT \x1b[0m - " + text); // red
    else if (logging >= 2 && logheight == 2)
        printevent(addTimeStamp() + "\x1b[33m  WARN \x1b[0m - " + text); // yellow
    else if (logging >= 3 && logheight == 3)
        printevent(addTimeStamp() + "\x1b[36m  INFO \x1b[0m - " + text); // cyan
    else if (logging >= 4 && logheight == 4)
        printelse(addTimeStamp() + "\x1b[36m  INFO \x1b[0m - " + text); // cyan
    else if (logging >= 5 && logheight == 5)
        printelse(addTimeStamp() + "\x1b[32m DEBUG \x1b[0m - " + text); // green

};

function addTimeStamp() {
    var curdate = new Date();
    text = ("0" + curdate.getDate()).slice(-2) + "-" +
        ("0" + (curdate.getMonth() + 1)).slice(-2) + "-" +
        curdate.getFullYear() + "_" +
        ("0" + curdate.getHours()).slice(-2) + ":" +
        ("0" + curdate.getMinutes()).slice(-2) + ":" +
        ("0" + curdate.getSeconds()).slice(-2);
    return text;
}

function printevent(text) {
    fs.appendFile("logs/event.log", "'" + text + "'\n", "utf8", (err) => {
        if (err) throw err;
    });
    console.log(text);
}

function printelse(text) {
    fs.appendFile("logs/info.log", "'" + text + "'\n", "utf8", (err) => {
        if (err) throw err;
    });
    console.log(text);
}