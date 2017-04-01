function ping(data, added) {
    data.msg.channel.send("http://generic.sucks Heartbeat: " + added.bot.ping + "ms, *Getting latency*").then(msg => {
        msg.edit(msg.content.replace("*Getting latency*", "Latency: " + Math.floor(new Date(msg.createdTimestamp).valueOf() - new Date(data.msg.createdTimestamp).valueOf()) + "ms"));
    }).catch(data.err);
}

module.exports = {
    commands: [
        {
            call: ping,
            trigger: ["ping", "genericsucks"],
            additional: ["bot"],
            description: "Generic sucks so I'll tell you my ping",
            category: "basic"
        }
    ]
};
