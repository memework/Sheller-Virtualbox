let child_process = require("child_process"),
    fs = require("fs"),
    virtualbox = require("virtualbox-soap"),
    tokens = require("../secrets.json"),
    blacklisted = require("../naughty.json").blacklist;


// let websessionManager;
// let vbox;
// let machine;
// let session;
// let iconsole;
let mouse;
let keyboard;
// let guest;

const serverURL = "http://localhost:18083"; // This url is the default one, it can be omitted 

function virtualboxinit(callback, data) {
    virtualbox(serverURL).then(websessionManager => {
        websessionManager.logon(tokens.username, tokens.password).then(vbox => {
            vbox.findMachine(tokens.vmname).then(machine => {
                websessionManager.getSessionObject(vbox).then(session => {
                    machine.launchVMProcess(session, "headless").then(progress => {
                        progress.waitForCompletion(-1).then(() => {
                            session.getConsole().then(iconsole => {
                                iconsole.getMouse().then(mouse2 => {
                                    mouse = mouse2;
                                    iconsole.getKeyboard().then(keyboard2 => {
                                        keyboard = keyboard2;
                                        console.log("Ready!");
                                        callback();
                                    }).catch(data.err);
                                }).catch(data.err);
                            }).catch(data.err);
                        }).catch(data.err);
                    }).catch(data.err);
                }).catch(data.err);
            }).catch(data.err);
        }).catch(data.err);
    }).catch(data.err);
}

function grabVMScreen(data, delay) {
    setTimeout(() => { // Wait a second before grabbing screenshot so that the OS has time to react to our changes
        let screenshotfile = "/tmp/sheller-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000) + ".png";
        child_process.exec("vboxmanage controlvm " + tokens.vmname + " screenshotpng " + screenshotfile, function (error, stdout, stderr) {
            if (error) {
                data.msg.channel.send("Error: ```" + error + "```");
                return;
            }
            if (stderr && stderr.trim() != "") {
                data.msg.channel.send("Error: ```" + stderr + "```");
                return;
            }
            data.msg.channel.sendFile(screenshotfile, "generic-sucks.png").then(() => { //msg
                setTimeout(function () {
                    fs.unlink(screenshotfile, (err) => { if (err) console.warn(err); });
                }, 1000);
                // setTimeout(function () {
                //     msg.delete();
                // }, 1000 * 30);
            }).catch(data.err);
        });
    }, delay || 1000);
}

function screenshot(data) { // t == "screengrab" || t == "screenshot" || t == "'"
    grabVMScreen(data, 0);
}

function blacklist(data) {
    if (data.msg.member.id != "196769986071625728") {
        data.msg.channel.send("NOPE!");
        return false;
    }
    let mem = data.msgs.mentions.users[0];
    blacklisted.push(mem.id);
    data.msg.channel.send(":ok_hand: Added " + mem.username + "!");
}

function unblacklist(data) {
    if (data.msg.member.id != "196769986071625728") {
        data.msg.channel.send("NOPE! :hammer:");
        return false;
    }
    let mem = data.msgs.mentions.users[0];
    blacklisted.push(mem.id);
    let ind = blacklisted.indexOf(mem);
    if (ind == -1) {
        data.msg.channel.send("That user is not in the blacklist!");
        return false;
    }
    blacklisted.splice(ind, 1);
    data.msg.channel.send(":ok_hand " + mem + "! You're no longer in the blacklist :tada:");
}

function key(data) {
    let codes = [];

    let keys = data.args.join(" ").split("+");

    for (let k in keys) {
        keys[k] = keys[k].toUpperCase();
        if (!SCAN_CODES[keys[k]]) {
            data.msg.channel.send("The key `" + keys[k] + "` doesn't exist! Skipping...");
            continue;
        }
        let thecode = SCAN_CODES[keys[k]];
        for (let itm in thecode) {
            codes.push(thecode[itm]);
        }
    }
    for (let k in keys) {
        if (!SCAN_CODES[keys[k]]) continue;
        let thecode = SCAN_CODES.getBreakCode(keys[k]);
        for (let itm in thecode) {
            codes.push(thecode[itm]);
        }
    }

    keyboard.putScancodes(codes).then(function () {
        grabVMScreen(data);
    }).catch(data.err);
}

function keys(data) {
    data.msg.channel.send("Keys: ```" + Object.keys(SCAN_CODES).join(", ") + "```");
}

function type(data) {
    let codes = [];

    let keystmp = data.args.join(" ").split("");
    let keys = [];
    for (let k in keystmp) {
        if (/[A-Z]/g.test(keystmp[k])) keys.push({ kind: "SHIFT", type: "on" });
        switch (keystmp[k]) {
            case "{": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "[", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "}": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "]", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "\"": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "'", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "|": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "\\", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case ":": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: ";", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "!": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "1", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "@": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "2", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "#": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "3", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "$": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "4", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "%": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "5", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "^": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "6", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "&": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "7", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "*": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "8", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "(": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "9", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case ")": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "0", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "+": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "=", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "_": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "-", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "~": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "`", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "?": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: "/", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case "<": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: ",", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }
            case ">": { keys.push({ kind: "SHIFT", type: "on" }); keys.push({ kind: ".", type: "tap" }); keys.push({ kind: "SHIFT", type: "off" }); break; }

            default: {
                keys.push({ kind: keystmp[k], type: "tap" });
                break;
            }
        }
        if (/[A-Z]/g.test(keystmp[k])) keys.push({ kind: "SHIFT", type: "off" });
    }

    for (let k in keys) {
        keys[k].kind = keys[k].kind.toUpperCase();
        if (!SCAN_CODES[keys[k].kind]) {
            data.msg.channel.send("The key `" + keys[k].kind + "` doesn't exist! Skipping...");
            continue;
        }

        switch (keys[k].type) {
            case "on": {
                let thecode = SCAN_CODES[keys[k].kind];
                for (let itm in thecode) {
                    codes.push(thecode[itm]);
                }
                break;
            }
            case "off": {
                let breakcode = SCAN_CODES.getBreakCode([keys[k].kind]);
                for (let itm in breakcode) {
                    codes.push(breakcode[itm]);
                }
                break;
            }
            case "tap":
            default: {
                let thecode = SCAN_CODES[keys[k].kind];
                let breakcode = SCAN_CODES.getBreakCode([keys[k].kind]);
                for (let itm in thecode) {
                    codes.push(thecode[itm]);
                }
                for (let itm in breakcode) {
                    codes.push(breakcode[itm]);
                }
                break;
            }
        }
    }

    function _sendkeys(i) {
        if (!codes[i]) {
            grabVMScreen(data);
            return;
        }
        keyboard.putScancode(codes[i]).then(function () {
            i++;
            _sendkeys(i);
        }).catch(data.err);
    }

    _sendkeys(0);

    // keyboard.putScancodes(codes).then(function () {
    //   grabVMScreen(data);
    // }).catch(function (err) {
    //   data.msg.channel.send("Error: ```\n" + err + "```");
    // });
}

function mousemove(data) {
    mouse.putMouseEvent(data.args[0], data.args[1], 0, 0, 0).then(function () {
        grabVMScreen(data);
    }).catch(data.err);
}

function scroll(data) {
    mouse.putMouseEvent(0, 0, data.args[0], data.args[1], 0).then(function () {
        grabVMScreen(data);
    }).catch(data.err);
}

function click(data) {
    let clickmask = 0;
    if (!data.args || !data.args[0]) data.args = ["left"];
    switch (data.args[0].toLowerCase()) {
        case "right":
        case "r":
        case "1": {
            clickmask = 0x02;
            break;
        }
        case "middle":
        case "m":
        case "3": {
            clickmask = 0x04;
            break;
        }
        default: {
            clickmask = 0x01;
            break;
        }
    }
    mouse.putMouseEvent(1, 1, 0, 0, clickmask).then(function () {
        mouse.putMouseEvent(1, 1, 0, 0, 0x00).then(function () {
            grabVMScreen(data);
        }).catch(data.err);
    }).catch(data.err);
}

function release(data) {
    mouse.putMouseEvent(1, 1, 0, 0, 0x00).then(function () {
        grabVMScreen(data);
    }).catch(data.err);
}

function press(data) {
    mouse.putMouseEvent(1, 1, 0, 0, 0x00).then(function () {
        grabVMScreen(data);
    }).catch(data.err);
}


// "Borrowed" from node-virtualbox

var codes;

codes = {

    "ESCAPE": [0x01],
    "1": [0x02],
    "2": [0x03],
    "3": [0x04],
    "4": [0x05],
    "5": [0x06],
    "6": [0x07],
    "7": [0x08],
    "8": [0x09],
    "9": [0x0A],
    "0": [0x0B],
    "MINUS": [0x0C],
    "-": [0x0C],
    "EQUAL": [0x0D],
    "=": [0x0D],
    "BACKSPACE": [0x0E],
    "BKSP": [0x0E],
    "TAB": [0x0F],

    "Q": [0x10],
    "W": [0x11],
    "E": [0x12],
    "R": [0x13],
    "T": [0x14],
    "Y": [0x15],
    "U": [0x16],
    "I": [0x17],
    "O": [0x18],
    "P": [0x19],
    "LEFTBRACKET": [0x1A],
    "[": [0x1A],
    "RIGHTBRACKET": [0x1B],
    "]": [0x1B],
    "ENTER": [0x1C],
    "CTRL": [0x1D],
    "A": [0x1E],
    "S": [0x1F],

    "D": [0x20],
    "F": [0x21],
    "G": [0x22],
    "H": [0x23],
    "J": [0x24],
    "K": [0x25],
    "L": [0x26],
    "SEMICOLON": [0x27],
    ";": [0x27],
    "QUOTE": [0x28],
    "\"": [0x28],
    "BACKQUOTE": [0x29],
    "`": [0x29],
    "SHIFT": [0x2A],
    "BACKSLASH": [0x2B],
    "\\": [0x2B],
    "Z": [0x2C],
    "X": [0x2D],
    "C": [0x2E],
    "V": [0x2F],

    "B": [0x30],
    "N": [0x31],
    "M": [0x32],
    "COMMA": [0x33],
    ",": [0x33],
    "PERIOD": [0x34],
    ".": [0x34],
    "SLASH": [0x35],
    "/": [0x35],
    "R_SHIFT": [0x36],
    "PRT_SC": [0x37],
    "ALT": [0x38],
    "SPACE": [0x39],
    " ": [0x39],
    "CAPS_LOCK": [0x3A],
    "F1": [0x3B],
    "F2": [0x3C],
    "F3": [0x3D],
    "F4": [0x3E],
    "F5": [0x3F],

    "F6": [0x40],
    "F7": [0x41],
    "F8": [0x42],
    "F9": [0x43],
    "F10": [0x44],
    "NUM_LOCK": [0x45], // May be [0x45, 0xC5],
    "SCROLL_LOCK": [0x46],
    "NUMPAD_7": [0x47],
    "NUMPAD_8": [0x48],
    "NUMPAD_9": [0x49],
    "NUMPAD_SUBTRACT": [0x4A],
    "NUMPAD_4": [0x4B],
    "NUMPAD_5": [0x4C],
    "NUMPAD_6": [0x4D],
    "NUMPAD_ADD": [0x4E],
    "NUMPAD_1": [0x4F],

    "NUMPAD_2": [0x50],
    "NUMPAD_3": [0x51],
    "NUMPAD_0": [0x52],
    "NUMPAD_DECIMAL": [0x53],
    "F11": [0x57],
    "F12": [0x58],

    // Same as other Enter key
    // 'NUMBER_Enter'    : [0xE0, 0x1C],
    "R_CTRL": [0xE0, 0x1D],

    "NUMBER_DIVIDE": [0xE0, 0x35],
    //
    // 'NUMBER_*'        : [0xE0, 0x37],
    "R_ALT": [0xE0, 0x38],

    "HOME": [0xE0, 0x47],
    "UP": [0xE0, 0x48],
    "PAGE_UP": [0xE0, 0x49],
    "LEFT": [0xE0, 0x4B],
    "RIGHT": [0xE0, 0x4D],
    "END": [0xE0, 0x4F],

    "DOWN": [0xE0, 0x50],
    "PAGE_DOWN": [0xE0, 0x51],
    "INSERT": [0xE0, 0x52],
    "DELETE": [0xE0, 0x53],
    "WINDOW": [0xE0, 0x5B],
    "WIN": [0xE0, 0x5B],
    "LWIN": [0xE0, 0x5B],
    "R_WINDOW": [0xE0, 0x5C],
    "RWIN": [0xE0, 0x5C],
    "MENU": [0xE0, 0x5D],

    "PAUSE": [0xE1, 0x1D, 0x45, 0xE1, 0x9D, 0xC5]
};

codes.getBreakCode = function (key) {
    var makeCode = codes[key];
    if (makeCode === undefined) {
        throw new Error("Undefined key: " + key);
    }

    if (key === "PAUSE") {
        return [];
    }

    if (makeCode[0] === 0xE0) {
        return [0xE0, makeCode[1] + 0x80];
    } else {
        return [makeCode[0] + 0x80];
    }
};

var SCAN_CODES = codes;

// End snippet


module.exports = {
    preexec: function (data, callback) {
        callback(blacklisted.indexOf(data.msg.member.id) == -1);
    },
    sendvars: function (vars) {
        vars.bot.once("ready", () => {
            virtualboxinit(function () {
                vars.bot.channels.get("295396269122387969").send("The VM is now ready! :+1:");
            }, {err: function(err) {
                if(err) vars.bot.channels.get("295396269122387969").send("The VM failed to start :sob: It failed with the error: ```" + err + "```");
            }});
        });
    },
    commands: [
        {
            trigger: "mouse",
            call: mousemove,
            description: "Changes the mouse's relative position by the given coordinates in X Y format.",
            category: "virtualbox"
        },
        {
            trigger: "click",
            call: click,
            description: "Clicks the given mouse button (Leave blank for left click)",
            category: "virtualbox"
        },
        {
            trigger: "key",
            call: key,
            description: "Presses the given key combination (Combine with `+`) Usage: `key win+r`",
            category: "virtualbox"
        },
        {
            trigger: ["screengrab", "screenshot", "'"],
            call: screenshot,
            description: "Sends an image of the screen's contents",
            category: "virtualbox"
        },
        {
            trigger: "type",
            call: type,
            description: "Types the given string.",
            category: "virtualbox"
        },
        {
            trigger: "scroll",
            call: scroll,
            description: "Moves the scroll wheel a given amount in Y X format",
            category: "virtualbox"
        },
        {
            trigger: "press",
            call: press,
            description: "Holds the given mouse button down until release is used",
            category: "virtualbox"
        },
        {
            trigger: "release",
            call: release,
            description: "Releases any mouse button that was being held down by press",
            category: "virtualbox"
        },
        {
            trigger: "keys",
            call: keys,
            description: "Gives a list of all the keys you can use with the key command",
            category: "virtualbox"
        },
        {
            trigger: "blacklist",
            call: blacklist,
            description: "Adds a given user to the blacklist",
            category: "heating's commands pls no touch kthx"
        },
        {
            trigger: "unblacklist",
            call: unblacklist,
            description: "Removes a given user from the blacklist",
            category: "heating's commands pls no touch kthx"
        }
    ]
};
