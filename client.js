var {winston, db} =  require("./logger.js"); // lol
var auth = require("./auth.json");

var config = {
    api:{
        "apiBaseUrl":"https://www.f-list.net/json/",
        "endpoints":{
            "getApiTicket":"getApiTicket.php",
            "kinklist":"kink-list.php",
            "infolist":"info-list.php",
            "addbookmark":"api/bookmark-add.php",
            "listbookmark":"api/bookmark-list.php",
            "removebookmark":"api/bookmark-remove.php",
            "profile":"api/character-data.php"
        }
    },
    fchat:{
        options:{
            // "debug":true,
            "joinOnInvite":true,
            "autoPing":true
        },
        client:{
            "name":auth.botname
        },
        // url:"wss://chat.f-list.net:9722" //unencrypted actual chat
        // url:"wss://chat.f-list.net:9799" //TLS encrypted actual
        // url:"wss://chat.f-list.net:8799" //TLS encrypted dev
        // url:"wss://chat.f-list.net:8722" //unencrypted dev
        url:"wss://chat.f-list.net/chat2"
    }
};
var auth = require("./auth.json");

const Fchat = require("lib-fchat/lib/Fchat");
var client = new Fchat(config);
client.version="1.0.0";

module.exports = client;
