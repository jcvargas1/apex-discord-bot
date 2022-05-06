import dotenv from 'dotenv';
dotenv.config()
import fetch from 'node-fetch';
import Discord, { MessageEmbed } from 'discord.js';
import client, {juan_export, kial_export, bobby_export, jarrett_export, jedd_export} from './bot.js'
import {insert_new_match, get_last_timestamp} from './db_functions.js'


// Loops during $session command. Every 3 minutes for bridge api call and every 30 sec for game api call to see if new matches have been added to json list.
export async function getData(user_name) {

    let curr_user = user_name
    let match_kills = '0'
    let match_damage = '0'
    let match_win = '0'
    let match_win_embed = 'No <a:frogtongueout:967376389332426852>'
    let timeout = Math.floor(Date.now() / 1000) + 3600

    while (curr_user.sess_flag != false) {
        try {
            let responsefetch = await fetch(curr_user.match_sum_url, {method:'GET'})
            let time_check = await get_last_timestamp(curr_user)
            let response = await responsefetch.json()
        
            console.log(`Game list request for ${curr_user.name}`)
            
            // Compares last game time stamp to current time. If its been more than an hour it will stop tracking session for the user
            if( Math.floor(Date.now() / 1000) > timeout) {
                curr_user.sess_flag = false
                console.log(`${curr_user.name} has timed out. Closing session.`);
                client.channels.cache.get('omit').send(`${curr_user.name} has timed out. Closing tracking session.`)
            }

            if(response[0].gameEndTimestamp > time_check) {
                time_check = response[0].gameStartTimestamp
                timeout = Math.floor(Date.now() / 1000) + 3600
                for (let j = 0; j < (response[0].gameData).length; j++) {
                    
                    if (response[0].gameData[j].key === 'kills' || response[0].gameData[j].key ==='specialEvent_kills'){
                        console.log('kills: ' + String(response[0].gameData[j].value))
                        match_kills = String(response[0].gameData[j].value)
                    }
                    if (response[0].gameData[j].key === 'damage' || response[0].gameData[j].key ==='specialEvent_damage'){
                        console.log('damage: ' + String(response[0].gameData[j].value))
                        match_damage = String(response[0].gameData[j].value)
                    }
                    if (response[0].gameData[j].key === 'wins_season_12' || response[0].gameData[j].key === 'specialEvent_wins'){
                        console.log('wins: ' + String(response[0].gameData[j].value))
                        match_win =  String(response[0].gameData[j].value)

                        if (response[0].gameData[j].value === 1) {
                            match_win_embed = 'Yes! GG <a:cooldoge:784358170755072030>'
                        }
                    }
                    
                }
                let matchTime = response[0].gameLengthSecs;
                let match_length_min = Math.floor( matchTime % 3600 / 60).toString().padStart(2,'0');
                let match_length_seconds =  Math.floor(matchTime % 60).toString().padStart(2,'0');
                let finalTime = match_length_min + ':' + match_length_seconds;
                
                
               
                const newEmbed = new Discord.MessageEmbed()
                    .setColor(0x70ACC3)
                    .setTitle(response[0].name)
                    .addFields(
                    {name: 'Legend', value: response[0].legendPlayed, inline: true},
                    {name: 'Game Length', value: finalTime,inline: true},
                    {name: '\u200B ', value: '\u200B '},
                    {name: 'Kills', value: match_kills, inline: true},
                    {name: 'Damage', value: match_damage, inline: true},
                    {name: 'Win?', value: match_win_embed, inline: true},
                )
                        .setThumbnail(`https://api.mozambiquehe.re/assets/icons/${(response[0].legendPlayed).toLowerCase()}.png`)
                        .setTimestamp()
                insert_new_match(curr_user, response[0].legendPlayed, match_kills, match_damage, match_win, finalTime, response[0].gameStartTimestamp, response[0].gameEndTimestamp)
                client.channels.cache.get('omit').send({ embeds: [newEmbed]})
            }
        }catch(err){console.log("Error with getData. probably no entry in for user yet")}

            await timer(30000);
        }
            
    }
    


// Manages /bridge api for watching matches
export async function session_manager(user_name) {

    let curr_user = user_name
    
    while (curr_user.sess_flag != false) {
        let response = await fetch(curr_user.bridge_url, {method:'GET'})
        response = await response.json()
        console.log(`Bridge request for ${curr_user.name}`)
        await timer(20000);
    }
}

// Gets a summary stats for the player
export async function get_user_stats(curr_user) {

    let response = await fetch(curr_user.bridge_url, {method:'GET'})
    response = await response.json()
    console.log(`Stats request for ${curr_user.name}`)
    let max_br_kills = 0;
    let br_legend_kills = '';
    let legendsArray = ['Revenant','Crypto', 'Horizon','Gibraltar', 'Wattson','Fuse', 'Bangalore', 'Wraith', 'Octane', 'Bloodhound', 'Caustic', 'Lifeline', 'Pathfinder',
    'Loba', 'Mirage', 'Rampart', 'Valkyrie', 'Seer', 'Ash', 'Mad Maggie']

    for (let i = 1; i <= legendsArray.length; i++){
        let currLegend = legendsArray[i]

        try {

            if (response['legends']['all'][currLegend].data[0].value != null && response['legends']['all'][currLegend].data[0].key === 'kills'){

                let legendValue = response['legends']['all'][currLegend].data[0].value
                if(legendValue > max_br_kills)
                {
                    max_br_kills = legendValue
                    br_legend_kills = currLegend
                }  
        }       
    }
        catch(err) {}
}
    // sends message to discord channel
    const newEmbed = new Discord.MessageEmbed()
    .setColor(0x70ACC3)
    .setTitle(response.global.name)
    .addFields(
    {name: 'Level', value: String(response.global.level),inline: true},
    {name: 'Current BR Rank', value: `${response.global.rank.rankName} ${response.global.rank.rankDiv}`, inline: true},
    {name: 'Current Arenas Rank', value: `${response.global.arena.rankName} ${response.global.arena.rankDiv}`, inline: true},
    {name: 'Most Legend Kills', value: `${String(br_legend_kills)}: ${max_br_kills}`, inline: true},


)
        .setThumbnail(response.global.rank.rankImg)
        .setTimestamp()

    try {
        let data_length = (Object.keys(response['total'])).length
        let data_array = Object.keys(response['total'])

        for (let j = 0; j < data_length; j++){

                let selector = data_array[j]
                if (selector !== 'kd') {
                    let data_name = response['total'][selector].name
                    let data_value = String(response['total'][selector].value)

                    newEmbed.addField(data_name,data_value, true)
                }   
        }
    }
        catch(err){}


    client.channels.cache.get('omit').send({ embeds: [newEmbed]})

    }

// Help command to show users what commands are available
export function help_info() {

    const newEmbed = new Discord.MessageEmbed()
    .setColor(0x70ACC3)
    .setTitle('Command List')
    .addFields(
    {name: '$session', value: 'Starts/Ends your match tracking'},
    {name: '$last x', value: 'Gets your most recent x matches where x is a number you choose'},
    {name: '$stats', value: 'Gets a summary of your profile'},
    {name: '$legend legend name', value: 'Gets a summary of your selected legend'},
    {name: '$damage', value: 'Get game with most damage'},
    {name: '$kills', value: 'Get game with most kills'},

)

client.channels.cache.get('omit').send({ embeds: [newEmbed]})

}

// Command for showing stats for specific legend for individual person
export async function get_legend_data(curr_user, select_legend) {

    let response = await fetch(curr_user.bridge_url, {method:'GET'})
    response = await response.json()
    console.log(`Stats request for ${curr_user.name}`)

    try {
    let legend_selection = select_legend.charAt(0).toUpperCase() + select_legend.slice(1);

    console.log(legend_selection)

    const newEmbed = new Discord.MessageEmbed()
    .setColor(0x70ACC3)
    .setTitle(`${response.global.name} - ${legend_selection}`)
    .setTimestamp()
    .setThumbnail(`https://api.mozambiquehe.re/assets/icons/${legend_selection.toLowerCase()}.png`)

    try {
        let data_length = (response['legends']['all'][legend_selection].data).length
        for (let j = 0; j < data_length; j++){

                let selector = response['legends']['all'][legend_selection].data[j].key
                let data_name = response['legends']['all'][legend_selection].data[j].name
                let data_value = String(response['legends']['all'][legend_selection].data[j].value)

                newEmbed.addField(data_name,data_value, true)
                
                if (selector === 'kills'){
                    newEmbed.addField('BR Kills Top %' ,`${response['legends']['all'][legend_selection].data[j]["rank"].topPercent}%`, true)
                }
            }
        }
        catch(err){}

        client.channels.cache.get('omit').send({ embeds: [newEmbed]})
        } catch(err) {
        client.channels.cache.get('omit').send('Error. Either no data or legend not given try again in format "!legend legend name"')
    }
}

// Gets current crafting rotation for day/week
export async function get_crafting_rotation() {
    let response = await fetch(process.env.CRAFTING_ROT, {method:'GET'})
    response = await response.json()
    console.log(`Rotation request`)

    for (let i = 0; i < 2; i++){
        for (let j = 0; j <2; j++){
            let itemName = response[i].bundleContent[j].itemType.name
            itemName = itemName.replaceAll('_', ' ')
            let itemImage = response[i].bundleContent[j].itemType.asset
            let itemCost = response[i].bundleContent[j].cost
            let itemType = (response[i].bundleType).toUpperCase()
            let itemDate = convert_epoch(response[i].end)

            const newEmbed = new Discord.MessageEmbed()
            .setColor(0x70ACC3)
            .setTitle(`${itemName} - ${itemType}`)
            .setDescription(`Cost: ${itemCost}\n ${itemDate}`)
            .setThumbnail(itemImage)

            client.channels.cache.get('omit').send({ embeds: [newEmbed]})
        }

    }
}

// converts epoch to regular local time for user readability
export function convert_epoch(matchTime) {

    let itemDate = new Date((matchTime) * 1000)
    itemDate = itemDate.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
      });

    return itemDate
}

// Gets the game UID by seeing what the persons discord id is and matching it.
export function get_name_from_id(discid) {
    let curr_user = null;

    try {
        switch(discid) {
            case 'omit':
                curr_user = juan_export
                return curr_user
            case 'omit':
                curr_user = bobby_export
                return curr_user
            case 'omit':
                curr_user = kial_export
                return curr_user
            case 'omit':
                curr_user = jedd_export
                return curr_user
            case 'omit':
                curr_user = jarrett_export
                return curr_user
        } 

        console.log('Got user successfuly from id')
    } catch(err){}  
}

function timer(ms) { return new Promise(res => setTimeout(res, ms)); }