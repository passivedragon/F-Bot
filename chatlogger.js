const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('./dbs/chatlog.json');
const chatlog = low(adapter);

var {winston} = require('./logger.js');

var client = require("./client.js");

var numOfDaysToKeep = 5;
var numOfMsgsToKeep = 100;
// set a timer to delete all logs that are older than X days
function deleteOld(){
    winston.info("Deleting old messages...");
    var now = new Date().valueOf();
    for(thread in chatlog.get().value()){//clean up old messages for each thread
        if(thread == "channel"){//do the same thing for every channel thread
            //for
            contine;
        } else { //private threads
            chatlog.get(thread).filter(m=>{ //checking for date
                console.log("checking message for date:"+m);
                var then = Date(m.timestamp).valueOf();
                return (now-then)<(86400000*numOfDaysToKeep);
            }).write();
        }
    }
}

deleteOld();
setInterval(deleteOld, 24*60*60*1000); //delete old logs after a day

client.logChat = function(msg){
    console.log(msg);
    var logobj;
    var path;
    //prepare paths and logobjects
    if(msg.channel){//public
        path = "channel."+msg.channel;
        logobj = {
            "message":msg.message,
            "character":msg.character,
            "timestamp": new Date()
        };
    } else {//private
        path = msg.character;
        logobj = {
            "message":msg.message,
            "timestamp": new Date(),
            "mine": msg.selfauthored || false
        };
    }


    if(!chatlog.get(path).write()){//create new path if no valid path already, meaning the first message to get logged
        chatlog.set(path, [logobj]).write();
    } else {//otherwise just add
        chatlog.get(path).push(logobj).write();
    }
};

client.getLogs = function(source){ //handling for undefined responses to be done locally. Source is an object!
    if(source.channel){
        return chatlog.get("channel."+source.channel).write();
    } else if(source.character){
        return chatlog.get(source.character).write();
    }
}
