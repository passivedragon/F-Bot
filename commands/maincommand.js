const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('./dbs/random.json');
const randb = low(adapter);

var IHateNames = randb.keys().write();

module.exports = {
    "CommandArray":[
        {
            "name":"idea", //works!! TODO: Add a way for users to add their own ideas
            "desc":"gives back a random scene/character/plot idea",
            "private":true,
            "run": async function run(client, msg, args){
                var message = "";
                if(IHateNames.includes(args[0])){
                    message = `Random ${args[0]}: ` + randb.get(args[0]).write()[Math.floor(Math.random() * IHateNames.length)];
                } else {
                    message = `${args[0]} is not a valid category, please try on of these available ones: ` + IHateNames.join(', ');
                }
                client.sendMessage(msg.character, message);
            }
        },
        {
            "name":"addidea",
            "desc":"adds ideas to the data base. Please don't put too much stupid stuff in there... please?",
            "private":true,
            "run": async function run(client, msg, args){
                if(args[0] && args[1]){
                    // msg.message.slice();
                    var category = args.shift();
                    var newidea = args.join(' ');
                    randb.get(category).push(newidea).write();
                    client.sendMessage(msg.character, `Successfully added "${newidea}" to the collection of suggestions in ${category}. There are now ${randb.get(category).size().write()} entries in there!`);
                }
            }
        }
    ]
}
