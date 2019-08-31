'use strict';
process.title = `F-Chat Bot`;//only you can see this
var auth = require('./auth.json');
var {winston, db, restart, abortRestart} = require("./logger.js");
const fs = require("fs");
winston.silly("Logger initialized");

var client = require("./client.js");

require("./consoleinput");

const OPs = require('./OPs.json');

require("./clientcommands.js");


async function loadCommands(extensiveLogging){

    //preparing collections for commands (this is how they are accessible later)
    client.commands = {"private": new Map(), "channel": new Map()};

//need new command structure... One for public and one for private?

//I could also just give every command another object to denote it as either public, private or both

    var commandlocations = ['./commands/', './commands private/'];

    var commandsloaded = 0; //for show and debugging purposes
    var locationsloaded = 0; //
    await commandlocations.forEach(comloc =>{
        if(fs.existsSync(comloc)) fs.readdir(comloc, (err, files) => {
            if(extensiveLogging) console.log(`-------------- Reading files from ${comloc}`);
            if(err) winston.log(err);
            let jsfile = files.filter(f => f.split(".").pop() === "js");
            if(jsfile.length <= 0){
              if(extensiveLogging) console.log("Commands Folder empy, no commands found");
              return;
            }

            jsfile.forEach((f, i) => {
              if(!f.endsWith(".js")) return;
              let commandfile = require(comloc+f);
              if(extensiveLogging) console.log(`${f} found`);

              if (commandfile.CommandArray) {
                if(extensiveLogging) console.log("  installing multiple:");
                commandfile.CommandArray.forEach(element => {
                  if(!element.name || !(element.private || element.public)) return;
                  if(extensiveLogging) console.log(`      - ${element.name} ${element.private?"private":""} ${element.public?"public":""}`);
                  if(element.private){
                      client.commands.private.set(element.name, element);
                  }
                  if(element.public){
                      client.commands.public.set(element.name, element);
                  }

                  commandsloaded += 1;
                });
              }
            });
            locationsloaded=+1;
            winston.info(`successfully loaded ${commandsloaded} commands from ${locationsloaded + "/" + commandlocations.length} locations`);
        });
    });
    return commandsloaded;
} // not gonna bother for now
function resetCommands(){
  winston.info('reloading all bot commands');
  delete client.commands, client.aliases;
  loadCommands(false);
}
loadCommands(true); //ACTUALLY loading commands




client.onOpen(ticket => {
    winston.info(`Websocket connection opened. Identifying with ticket: ${ticket}`);
});

client.on("IDN", () => {
    winston.info(`Identification as ${client.user.character} Successful!`);
    db.get('autojoin').write().forEach(chan => {
        client.joinChannel(chan);
    });
});

client.onMessage((msg)=>{
    // winston.verbose(msg);
    var code = msg.slice(0, 3);
    var obj = msg.length >3? JSON.parse(msg.slice(4)):{};

    client.prefix = "!";
    switch (code){
        case "SYS"://sent for channel updates, such as changing moderators
        case "COA"://new moderator character for a channel
        case "TPN"://A user started/stopped typing
        case "COL"://sent when entering a channel, contains op list
        case "ICH"://sent when entering a channel, contains user list, as well as the channel mode
        case "CDS"://sent when entering a channel, contains the channel description. Should maybe be logged to be accessible later?
        case "RTB"://Someone was added to the bookmarks of this acc
        case "JCH"://Someone joined a channel
        case "FRL"://list of bookmarked chars
        case "HLO"://null hello message
        case "CON"://total count of online characterss
        case "IGN"://essentially null
        case "ADL"://list of chat ops
        case "PIN"://ping from the server, is answered by lib
            break;
        case "IDN"://Successful login, already handled by lib
            // winston.info(`Character`);
            break;
        case "VAR": //initial variable set up
            //don't deal with it for now
            break;
        case "LIS":
            //don't deal with it for now
            break;
        case "STA":
            //don't deal with it for now
            break;
        case "NLN":
            //don't deal with it for now
            break;
        case "FLN":
            //don't deal with it for now
            break;
        case "PRI"://private message
            winston.silly(obj);
            if(obj && obj.message.startsWith(client.prefix)){//prefix not variable yet
                //actually go through the client.command.private set
                var args =  obj.message.slice(client.prefix.length).split(' ');
                var command = args.shift();
                var cmd=client.commands.private.get(command);
                if(cmd != undefined){
                    if(cmd.adminOnly && !OPs.admins.includes(obj.character)){
                        client.sendMessage(obj.character, "You are not allowed to use that command, I'm sorry."); // works!
                        return;
                    } else {
                        cmd.run(client, obj, args);
                    }
                }
                //client.commands.aliases? Should think about that
            } else {
                OPs.admins.forEach(admin=>{
                    client.sendMessage(admin, `[user]${obj.character}[/user] send a message: ` + obj.message);
                    //wait a second!
                });
            }
            break;
        case "MSG"://public message
            // don't do anything here yet!
            winston.verbose("Public message in channel "+obj.channel+": "+obj.message);
        break;
        default:
            winston.error("unhandled message incoming!" + msg);
    }
});

client.onError(err=>{
    winston.error(err);
    // console.log(err);
});




// winston.debug(JSON.stringify(client));
console.log(client);
client.reconnect(); // actually connects it
