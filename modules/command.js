function help(data, added) {
    data.msg.channel.send(added.generatehelp(data.args.join(" ")));
}

module.exports.commands = [
    {
        trigger: ["help"],
        description: "Gives this page!",
        additional: ["generatehelp"],
        call: help,
        category: "basic"
    }
];
