# apex-discord-bot
A private bot created for the social instant messaging platform *Discord* that utilizes a reverse engineered API for the game *Apex Legends* and allows users to track their game matches as well as view data about their game account. 

# Why?
*Apex Legends* is a popular first person shooter video game made by *Respawn Entertainment*. At the moment they have no way of being able to show data about your previous matches or a centralized location that allows you to view specific data rapidly. I created a bot that utilizes a reverse engineered API that allows users to track their gaming sessions which are uploaded to a Cloud Mongo database and to Discord and from there allow the user to see various stats about their account via bot commands in which the data is retrieved either from the API call or from the Mongo database. By creating this bot and having it in a Discord server it allows for a more engaging and informational time for all users involved. The bot is hosted on a Google Cloud Compute Engine instance.

# Features
<ul>
  <li> Create sessions to track your gameplay which upload to Discord and MongoDB in real time. Auto-time out also implemented.
  <li> View overall stats about your account including data not openly available in game
  <li> View last x number of games you have played and their respective stats
  <li> View most damage & most kills ever done using data from MongoDB
  <li> View current daily and weekly crafting rotations available
  <li> View stats for a specific legend (character)
</ul>

# Future Features
As time passes and more useful data is entered into the database I would like to implement these features.
<ul>
  <li> The ability to generate graphs for specific data
  <li> Ability to link users into group sessions to see data specifically for certain team combinations
  <li> Possible front-end to see the data as opposed to only seeing it via Discord. This allows for a more visual experience. 
</ul>

# Tech Used

**Language/Libraries:** Javascript, Node.js/npm, Discord API, Apex Legends Status API, Fetch API

**Services**: Google Cloud Platform (Compute Engine Instance), MongoDB Atlas

**Tools/Etc.** : Ubuntu, Bash, Discord, Postman, VS Code, PM2

# Preview

![Help Example](https://github.com/jcvargas1/apex-discord-bot/blob/main/src/images/%24help_example.PNG)
![Session Example](https://github.com/jcvargas1/apex-discord-bot/blob/main/src/images/session_example.PNG)
![Stats Example](https://github.com/jcvargas1/apex-discord-bot/blob/main/src/images/%24stats_example.PNG)
![Damage Example](https://github.com/jcvargas1/apex-discord-bot/blob/main/src/images/%24damage_example.PNG)
![Kills Example](https://github.com/jcvargas1/apex-discord-bot/blob/main/src/images/%24kills_example.PNG)
![Last matches Example](https://github.com/jcvargas1/apex-discord-bot/blob/main/src/images/%24lastx_example.PNG)
![Crafting Example](https://github.com/jcvargas1/apex-discord-bot/blob/main/src/images/%24craft_example.PNG)
![Legend Example](https://github.com/jcvargas1/apex-discord-bot/blob/main/src/images/%24legend_example.PNG)


