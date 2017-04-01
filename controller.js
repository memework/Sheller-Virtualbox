let spawn = require("child_process").spawn;

function startApp() {
    let child = spawn("node", ["index.js"]);
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", function (data) {
        var str = data.toString();
        process.stdout.write(str);
    });
    child.on("close", function (code) {
        console.log("process exit code " + code);
        startApp();
    });
}

console.log("Starting!");
startApp();

