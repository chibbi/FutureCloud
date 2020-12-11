module.exports = function () {
    const fs = require("fs");

    const logging = 5;
    // logging = 0 only Errors
    // logging = 1 Errors and Alerts
    // logging = 2 Errors, Alerts and Warnings
    // dont recommend going below 3
    // logging = 3 Errors, Alerts, Warnings and infos (who uploaded ..)
    // logging = 4 Errors, Alerts, Warnings and infos (who visited)
    // logging = 5 Errors, Alerts, Warnings and infos (who visited) and debug

    module.log = function (text, logheight) {
        // should change it to switch case 
        if(logheight == "undefined") {
            console.log(addTimeStamp() + " NOLOGDEFINED - " + text);
        } else if (logging >= 0 && logheight == 0) {
            console.log(addTimeStamp() + " ERROR - " + text);
        } else if (logging >= 1 && logheight == 1) {
            console.log(addTimeStamp() + " ALERT - " + text);
        } else if (logging >= 2 && logheight == 2) {
            console.log(addTimeStamp() + "  WARN - " + text);
        } else if (logging >= 3 && logheight == 3) {
            console.log(addTimeStamp() + "  INFO - " + text);
        } else if (logging >= 4 && logheight == 4) {
            console.log(addTimeStamp() + "  INFO - " + text);
        } else if (logging >= 5 && logheight == 5) {
            console.log(addTimeStamp() + " DEBUG - " + text);
        }
    };

    module.printlog = function (text, logheight) {
        // should change it to switch case 
        if(logheight == "undefined") {
            console.log(addTimeStamp() + " NOLOGDEFINED - " + text);
        } else if (logging >= 0 && logheight == 0) {
            printevent(addTimeStamp() + " ERROR - " + text);
        } else if (logging >= 1 && logheight == 1) {
            printevent(addTimeStamp() + " ALERT - " + text);
            sendAlertMail();
        } else if (logging >= 2 && logheight == 2) {
            printevent(addTimeStamp() + "  WARN - " + text);
        } else if (logging >= 3 && logheight == 3) {
            printevent(addTimeStamp() + "  INFO - " + text);
        } else if (logging >= 4 && logheight == 4) {
            printelse(addTimeStamp() + "  INFO - " + text);
        } else if (logging >= 5 && logheight == 5) {
            printelse(addTimeStamp() + " DEBUG - " + text);
        }
    };

    function addTimeStamp() {
        var curdate = new Date();
        text =
            ("0" + curdate.getDate()).slice(-2) +
            "-" +
            ("0" + (curdate.getMonth() + 1)).slice(-2) +
            "-" +
            curdate.getFullYear() +
            "_" +
            ("0" + curdate.getHours()).slice(-2) +
            ":" +
            ("0" + curdate.getMinutes()).slice(-2) +
            ":" +
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

    return module;
};