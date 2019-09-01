

function cmdhelptext(cmd){
    return `${cmd.name}${cmd.private?" [color=green]private[/color]":""}${cmd.private?" [color=blue]public[/color]":""}: ${cmd.desc?cmd.desc:"No description given..."}`;
}

module.exports = {
    "CommandArray":[
        {
            "name":"help",
            "desc":"Shows a list of available commands and their descriptions",
            "private":true,
            "public":false, //would be spammy otherwise, but might just catch it and tell a user to just send it privately.
            "run": async function run(client, msg, args){
                if(msg.channel){
                    client.sendMessage(msg.character, "Please only use this command in a private conversation.");
                    return;
                }

                if(args[0]){ //see if there is a specific command a user would like to know about
                    var searchcommand = client.commands.private.get(args[0]) || client.commands.private.get(args[0]) || false;
                    if(searchcommand){
                        client.sendMessage(msg.character, `Requested help info about ${cmdhelptext(searchcommand)}`);
                        return;
                    }
                } else { //iterate through the commands and display all of their infos
                    var helpmessage = "";
                    helpmessage+= "[color=green]private[/color] commands:\n";
                    client.commands.private

                    helpmessage+= "[color=blue]public[/color] commands:\n";


                }
            }
        }
    ]
}
