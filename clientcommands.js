var client = require('./client.js');
var {winston} = require('./logger.js');
var auth = require('./auth.json');

const fetch = require("node-fetch");

const { URLSearchParams } = require('url');
async function sendApiRequest(url, body){
    const params = new URLSearchParams();
    Object.keys(body).forEach(k=>{
        params.append(k, body[k]);
    });
    return await fetch(client.config.api.apiBaseUrl + url, {method:"POST", body: params});
}

async function acquireTicket(){

    const params = new URLSearchParams();
    params.append('account', auth.user);
    params.append('password', auth.password);
    params.append('no_bookmarks', true);
    params.append('no_characters', true);
    params.append('no_friends', true);
    try{
        return await fetch('https://www.f-list.net/json/getApiTicket.php', { method: 'POST', body: params })
            .then(res => res.json()) // expecting a json response
            .then(json => {
                console.log(json);
                if(json.ticket) return json.ticket;
                // winston.silly(json);
            });
    } catch(err){
        winston.error(err.message);
    }
    winston.error("Ticket acquisition unsuccessful");
    return;
}



client.ticket={
    "timestamp":0,
    "current": undefined,
    "get": async function get(){
        if(client.ticket.current == undefined){
            winston.silly("Getting first ticket");
            //pass other if to update ticket
        }else if(new Date - client.ticket.timestamp < 25*60*1000) { // is valid for 30min, but updated after 25min
            winston.silly("Ticket still up to date");
            return client.ticket.current;
        }

        winston.silly("Getting new Ticket");
        client.ticket.current = undefined;
        client.ticket.current = await acquireTicket();
        // if(client.ticket.current == undefined){
        //     while(true){
        //         winston.debug("trying for new Ticket...");
        //         await setTimeout(async ()=>{
        //             client.ticket.current = await acquireTicket().then();
        //         }, 5000);
        //     }
        // }

        client.ticket.timestamp = new Date;
        return client.ticket.current;
    }
};


var zlib = require('zlib');
const gzip = zlib.createGzip();
const through2 = require('through2');

const toJSON = (objs) => {
    // let objs = [];
    return through2.obj(function(data, enc, cb) {
        objs.push(data);
        cb(null, null);
    }, function(cb) {
        console.log(this.toString());
        this.push(JSON.stringify(objs));
        cb();
    });
};

client.api={
    "getProfile": async function getProfile(name){
        return sendApiRequest(client.config.api.endpoints.profile, {"name": name}).then(r=>{
            if(r && r.body.readable){
                // Buffer.from(r.body)

                var final=[];
                try{ //.pipe(toJSON(final))
                    console.log(r.body.pipe(gunzip));
                    // .once("end", ()=>{
                    //     final.toString(console.log());
                    //     return final.toString();
                    // });
                } catch(err){console.log(err)}
            } else winston.error("Couldn't read response");
        });
    }
};

client.reconnect = async function(){
    try {
        winston.debug("Trying to connect");
        client.ticket.get().then( t=> {
            console.log(
                client.connect(auth.user, auth.password, auth.character, t)
            )
        });
    }
    catch(err){
        console.log(err);
    }
    client.setStatus("I am a bot, please ignore me!", "busy");
};

client.getChannels = async function(){
    client.send("ORS");// how to catch it tho? .once()?
    var ChanPromise = new Promise((resolve, reject)=>{
        var timer = setTimeout((reject)=>{
            reject;
        }, 30*1000);//30sec timer

        client.once("ORS", (msg)=>{//once is not defined yet!!!
            clearTimeout(timer);
            resolve(msg.channels);
        });
    });
}

client.sendMessage = async function(recipient, message){
    client.logChat({"character": recipient, message, "selfauthored": true});//logs own messages to have the threads make sense contextually
    client.send("PRI", {recipient, message});
};

client.sendChannelMessage = async function(channel, message){
    client.logChat({channel, message, "character":client.user.character});//logs own outgoing messages
    client.send("MSG", {channel, message});
};

client.setStatus = async function(statusmsg, status){
    client.send("STA", {
        "status": status || "online", //"online", "looking", "busy", "dnd", "idle", "away", and "crown"(don't use!)
        "statusmsg": statusmsg || "",
        "character": client.user.character
    });
};

client.joinChannel = async function(channel){
    client.send("JCH", {channel});
}

client.leaveChannel = async function(channel){
    client.send("LCH", {channel});
}

client.ignore = async function(action, character){
    if(["add", "delete", "notify", "list"].includes(action)){
        client.send("IGN", {action, character});
    } else winston.error(`Ignore with faulty action: ${action}`);
}

client.getKinks = async function(character){
    //either via JSON endpoint or websocket... :/
    //websocket would be KIN out and KID in

    //decided to use the JSON enpoint, it's significantly easier to fetch!
}

// eval client.setStatus("I am a Bot, please ignore me!", "busy")

// STA {"status": "looking", "statusmsg": "I'm always available to RP :)", "character": "Hexxy"}






// eval client.sendMessage("passivedragon", "Hello there, I just wanted to tell you that [user]passivedragon[/user] has just sent you a message with his new CHAT BOT *giggles like a maniac*")
