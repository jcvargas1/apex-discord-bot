import dotenv from 'dotenv';
dotenv.config()
import Discord, { Intents } from 'discord.js';
import {getData, get_name_from_id, session_manager, get_user_stats,help_info,get_legend_data, get_crafting_rotation} from './bot_funcs.js';
import {get_last_x_matches, get_most_kills, get_most_damage, connect_db} from './db_functions.js';


let avail_disc_ids = ['','','','',''] //info omitted for github


// objects for the players the bot was created for
let juan = {sess_flag: false, name: 'juan', bridge_url: process.env.JUAN_MATCH_SUM_API,match_sum_url: process.env.JUAN_MATCHES, db_coll: process.env.JUAN_DB}
let kial = {sess_flag: false, name: 'kial', bridge_url: process.env.KIAL_MATCH_SUM_API, match_sum_url: process.env.KIAL_MATCHES, db_coll: process.env.KIAL_DB}
let jedd = {sess_flag: false, name: 'jedd', bridge_url: process.env.JEDD_MATCH_SUM_API, match_sum_url: process.env.JEDD_MATCHES, db_coll: process.env.JEDD_DB}
let bobby = {sess_flag: false, name: 'bobby', bridge_url: process.env.BOBBY_MATCH_SUM_API, match_sum_url: process.env.BOBBY_MATCHES, db_coll: process.env.BOBBY_DB}
let jarrett = {sess_flag: false, name: 'jarrett', bridge_url: process.env.JARRETT_MATCH_SUM_API, match_sum_url: process.env.JARRETT_MATCHES, db_coll: process.env.JARRETT_DB}

const prefix = "$"


// connects to discord js client
const client =  new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]

})


// initial connection for the discord bot
client.on('ready', () => {
    console.log('Apex Bot has started.');
    client.user.setActivity('$help for commands')
    connect_db();
});

// Starts or ends tracking session as well as contains all the possible commands for the users to use
client.on('messageCreate', (message) => {

    // checks if prefix command is used
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    // message.author.id is from discord js which is checks what the UID of the person requesting the bot is
    else if (avail_disc_ids.includes(message.author.id) === true) {

        let curr_user = get_name_from_id(message.author.id)
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        
        if(args[0].toLowerCase() === 'session') {

            if (curr_user.sess_flag === false)
            {
                message.reply({
                    content: 'Beginning tracking session for ' + message.author.username,
                })
                console.log(`Beginning tracking session for ${curr_user.name}`)
            }
            else if (curr_user.sess_flag === true) {
                message.reply({
                    content: 'Ending tracking session for ' + message.author.username,
                })
                console.log(`Ending tracking session for ${curr_user.name}` )
            }
            curr_user.sess_flag = !curr_user.sess_flag
            session_manager(curr_user)
            getData(curr_user)
            
        }

        else if(args[0].toLowerCase() === 'last' && isNaN(args[1]) === false) {
            get_last_x_matches(curr_user, parseInt(args[1]));
        }

        else if(args[0].toLowerCase() === 'stats') {
            get_user_stats(curr_user)

        }

        else if(args[0].toLowerCase() === 'legend'){
            console.log(args[0])
            console.log(args[1])
            get_legend_data(curr_user, args[1])
        }

        else if (args[0].toLowerCase() === 'help'){
           help_info();
        }

        else if (args[0].toLowerCase() === 'craft'){
            get_crafting_rotation();
         }

        else if (args[0].toLowerCase() === 'kills'){
            get_most_kills(curr_user)
        }
        else if (args[0].toLowerCase() === 'damage'){
            get_most_damage(curr_user)
        }
        
        else if (args[0].toLowerCase() === 'admin' && isNaN(args[1]) === false && curr_user.name === 'juan'){

            try {
            console.log(args[1])
            let manualUser = get_name_from_id(args[1]);
            manualUser.sess_flag = !manualUser.sess_flag

            if (manualUser.sess_flag === true)
                {
                    message.reply({
                        content: 'Admin - Beginning tracking session for ' + manualUser.name,
                    })
                    console.log(`Admin - Beginning tracking session for ${manualUser.name}`)
                    session_manager(manualUser)
                    getData(manualUser)
                }
                else if (manualUser.sess_flag === false) {
                    message.reply({
                        content: 'Admin Ending tracking session for ' + manualUser.name,
                    })
                    console.log(`Admin - Ending tracking session for ${manualUser.name}` )
                }
            } catch(err) {console.log("Error. ID not recognized")}
    }

    // if user is not the 5 from above they get this message.
    else if(avail_disc_ids.includes(message.author.id) === false) {
        message.reply({
            content: 'Not authorized user.',
        })
        console.log(`${message.author.username} is not an authorized user.`)
    }
}
});

client.login(process.env.DISCORD_BOT_TOKEN);

// export client and users to other files for use and less code repeating
export default client;
export let juan_export = juan;
export let kial_export = kial;
export let jedd_export = jedd;
export let bobby_export = bobby;
export let jarrett_export = jarrett;







