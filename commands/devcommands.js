
//setting up ideal command structure to then configure how to import them
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
            "desc":"dangerous",
            "adminOnly":true,
            "private":true,
            // "public":false,
            "run": async function run(client, msg, args){
                eval(console.log(msg.message.slice(client.prefix + 5)));
            }
        },
        {
            "name":"info", // shouldn't show up with neither private or public
            "desc":"general infos",
            "run": async function run(client, msg, args){


                var message = ``;
                client.sendMessage(msg.character, message);
            }
        },
        {
            "name":"restart", // shouldn't show up with neither private or public
            "desc":"restarts the bot",
            "private":true,
            "adminOnly":true,
            "run": async function run(client, msg, args){
                client.restart(msg.toString(), args[0]|| 30*1000);
            }
        }
    ]
}
