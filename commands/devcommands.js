var {winston, db} = require("../logger.js");

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ('0' + h).slice(-2) + "h " + ('0' + m).slice(-2) + "m " + ('0' + s).slice(-2) + "s";
}

module.exports = {
    "CommandArray":[
        // {
        //     "name":"example command", // shouldn't show up with neither private or public
        //     "desc":"will be help text",
        //     "run": async function run(client, msg, args){
        //         //nothing
        //     }
        // },
        {
            "name":"echo",
            "desc":"repeats message back",
            "private":true,
            "public":false,
            "run": async function run(client, msg, args){
                client.sendMessage(msg.character, msg.message);
            }
        },
        {
            "name":"eval", //careeeeeful
            "desc":"dangerous!",
            "adminOnly":true,
            "private":true,
            // "public":false,
            "run": async function run(client, msg, args){
                var snippet = msg.message.slice(client.prefix + 5);
                var dangers = ["require", "import", "process"];
                if(dangers.some(d=>snippet.includes(d))){
                    winston.warn(`${msg.character} tried to run eval with a forbidden command!`);
                    client.sendMessage(msg.character, "Your snippet contained a forbidden command, so the bot stopped the execution to protect itself.");
                    return;
                } else {
                    try{
                        console.log(eval(snippet));
                    } catch(err){
                        client.sendMessage(msg.character, "encountered an error: "+err);
                    }
                }
            }
        },
        {
            "name":"info", // shouldn't show up with neither private or public
            "desc":"general infos",
            "run": async function run(client, msg, args){

                var message = `The bot has been up for ${secondsToHms(process.uptime())}`;
                client.sendMessage(msg.character, message);
            }
        },
        {
            "name":"restart", // shouldn't show up with neither private or public
            "desc":"restarts the bot",
            "private":true,
            "adminOnly":true,
            "run": async function run(client, msg, args){
                client.sendMessage(msg.client, await client.restart(msg.toString(), args[0]|| 30*1000));
            }
        }
    ]
}
