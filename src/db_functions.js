import { MongoClient } from 'mongodb'
import dotenv from 'dotenv';
import client from './bot.js' // Discord Client
import Discord, { MessageEmbed } from 'discord.js';
import {convert_epoch} from './bot_funcs.js'
dotenv.config()

// starts mongo client (db connection)
const mongoClient = new MongoClient(process.env.DATABASE)

export async function connect_db() {
    try {
        await mongoClient.connect();
        console.log('Connecting to db.')
    }
    catch (err) {console.log('Connection Error')}   
}

// Inserts new match entry into individuals database collection
export async function insert_new_match(user, legend_name, match_kills, match_damage, match_win, gameLength, gameStart, gameEnd) {
    try {


    const database = mongoClient.db('apex_bot')
    const user_collection = database.collection(user.db_coll)

    const new_match = {legend: legend_name, kills: match_kills, damage: match_damage, win: match_win, match_length:gameLength, time_start: gameStart, time_end: gameEnd}
    const result = await user_collection.insertOne(new_match);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);

    }
    catch(err) {
        console.error(err)

    }
}

// Allows user to get last x number of matches. It can't be in an embed message due to # constraints as well so it fits what it cans in less than 2000 characters. I rather not send multiple messages to avoid spamming the server
export async function get_last_x_matches(user, num_of_matches) {
   try {


    const database = mongoClient.db('apex_bot')
    const user_collection = database.collection(user.db_coll)
    const num_of_documents =  await user_collection.countDocuments()
    
    if (num_of_matches > num_of_documents) {
        client.channels.cache.get('omit').send(`Error. <:3853_jerryEh:686274327473291302> Amount exceeds quantity of matches saved. Choose ${num_of_documents} or less.`)  
    }

    else if (num_of_matches <= num_of_documents && num_of_matches != 0) {
        let match_queries =  await user_collection.find().sort({_id:-1}).limit(num_of_matches).toArray()
        
        let query_description = ''

        for (let i =0; i < num_of_matches; i++) {
            query_description +=`[ Legend: ${match_queries[i].legend} | Kills: ${match_queries[i].kills} | Damage: ${match_queries[i].damage} | Win: ${(match_queries[i].win)  === '0' ? 'No': 'Yes'} | Length: ${match_queries[i].match_length} ]\n` 
            
    }
        console.log('Query for get last x invoked')
        client.channels.cache.get('omit').send(query_description)
    }
    
}catch{err} {
    console.log(err)    
    }
}

// Function for getting the last time stamp from the latest entry in the users database collection.
// With this I can compare to the new matches coming in to make sure only new entries are added.
export async function get_last_timestamp(user) {
    console.log('Getting last time stamp...')
    const database = mongoClient.db('apex_bot')
    const user_collection = database.collection(user.db_coll)
    const num_of_documents =  await user_collection.countDocuments()

    if (num_of_documents > 0){
        let match_queries =  await user_collection.find().sort({_id:-1}).limit(1).toArray()
        
        console.log(`Last db time stamp: ${match_queries[0].time_end}`)
        return(match_queries[0].time_end)
    }
    else {
        return 0;
    }
    
}

// calculates most damage player has gotten from their db collection and sends it via discord embed
export async function get_most_damage(user) {

    const database = mongoClient.db('apex_bot')
    const user_collection = database.collection(user.db_coll)
    const num_of_documents =  await user_collection.countDocuments()
    let most_damage = '0'
    let legend, kills, game_length, if_won = ''
    let time_start = 0
    
    if (num_of_documents > 0) {
        let match_queries =  await user_collection.find().toArray()
        
        for (let i = 0; i < num_of_documents; i++) {
            if (parseInt(match_queries[i].damage) > parseInt(most_damage)){
                most_damage = match_queries[i].damage
                kills = match_queries[i].kills
                legend = match_queries[i].legend
                time_start = convert_epoch(match_queries[i].time_start)
                game_length = match_queries[i].match_length
                if_won = match_queries[i].win
            }
            
        }
        const newEmbed = new Discord.MessageEmbed()
            .setColor(0x70ACC3)
            .setTitle('Most Damage Game')
            .addFields(
            {name: 'Legend', value: legend, inline: true},
            {name: 'Game Length', value: game_length,inline: true},
            {name: 'Damage', value:  most_damage, inline: true},
            {name: 'Kills', value: kills, inline: true},
            {name: 'Win?', value: if_won, inline: true},
            {name: 'Date', value: time_start, inline: true},

        )
            .setThumbnail(`https://api.mozambiquehe.re/assets/icons/${legend.toLowerCase()}.png`)
            client.channels.cache.get('omit').send({ embeds: [newEmbed]})   
    }

}

// calculates most kills player has gotten from their db collection and sends it via discord embed
export async function get_most_kills(user) {
   
    const database = mongoClient.db('apex_bot')
    const user_collection = database.collection(user.db_coll)
    const num_of_documents =  await user_collection.countDocuments()
    let most_kills = '0'
    let legend, kills, game_length, if_won = ''
    let time_start = 0
    
    
    if (num_of_documents > 0) {
        
        let match_queries =  await user_collection.find().toArray()

        for (let i = 0; i < num_of_documents; i++) {
            
            if (parseInt(match_queries[i].kills) > parseInt(most_kills)){
                damage = match_queries[i].damage
                most_kills = match_queries[i].kills
                legend = match_queries[i].legend
                time_start = convert_epoch(match_queries[i].time_start)
                game_length = match_queries[i].match_length
                if_won = match_queries[i].win
            }
            
        }

        const newEmbed = new Discord.MessageEmbed()
            .setColor(0x70ACC3)
            .setTitle('Most Kills Game')
            .addFields(
            {name: 'Legend', value: legend, inline: true},
            {name: 'Game Length', value: game_length, inline: true},
            {name: 'Kills', value: most_kills, inline: true},
            {name: 'Damage', value: String(damage), inline: true},
            {name: 'Win?', value: `${(if_won)  === '0' ? 'No': 'Yes'}`, inline: true},
            {name: 'Date', value: time_start, inline: true},
        )
            .setThumbnail(`https://api.mozambiquehe.re/assets/icons/${legend.toLowerCase()}.png`)
            client.channels.cache.get('omit').send({ embeds: [newEmbed]})
    }
}