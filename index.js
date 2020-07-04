require("dotenv").config();
const scraper = require("./scraper");
const Discord = require('discord.js');
const client = new Discord.Client();
client.once("ready", () => {
  console.log("Ready!");
});
client.on("message", (message) => {
  if (message.author.bot) return;
  var arr = message.content.split("/");
  var mov = arr[1];
  if(arr[0]==="imdb")
  {
    scraper.getMovie(mov).then((movie) => {
      var summary = movie.summary;
      var rating = movie.imdbRating;
      var title = movie.title;
      var trailer = movie.trailer;

      message.channel.send("Title : " + title + "\n" + "Rating : " + rating + "\n" + "Summary : " + summary + "\n" + "Trailer : " + trailer + "\n");
    });
  }
  
});
client.login(process.env.BOT_TOKEN);