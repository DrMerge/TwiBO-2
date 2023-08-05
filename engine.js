require("dotenv").config();
const express = require("express");
const { format } = require("date-fns");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnect");
const { TwitterApi } = require("twitter-api-v2");
const fsPromise= require('fs').promises
const path= require("path")
// Connect to MongoDB
connectDB();

const findAll = async () => {
  
  try {
    const UsersDB = require("./models/userModel");
    const users = await UsersDB.find({ botOn: true, total_CP: { $ne: 0 } });

    if (users.length === 0) {

      fsPromise.appendFile(path.join(__dirname,"log","terminal.txt"),"no users active \n \n","utf-8")
      
      setTimeout(findAll, 60000);
      return;
    }

    for (const user of users) {
      console.log(`${user.username} active`);

      if (
        !user.APIKEY ||
        !user.APISECRET ||
        !user.ACCESSTOKEN ||
        !user.ACCESSSECRET
      )
        return null;

      const client = new TwitterApi({
        appKey: user.APIKEY,
        appSecret: user.APISECRET,
        accessToken: user.ACCESSTOKEN,
        accessSecret: user.ACCESSSECRET,
      });

      const bearer = new TwitterApi(user.BEARER_TOKEN);

      const twitterClient = client.readWrite;
      const twitterBearer = bearer.readOnly;

      const generate = async () => {
        try {
          const openai = require("./gpt3Client.js");
          const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Read past tweets ${user.tweet}, ${user.prompt} without repeating past tweets`,
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          });

          const data = response.data.choices[0].text;
          const currentDateAndTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");

          const tweetObject = {
            tweetText: data,
            time: currentDateAndTime,
          };

          user.tweet.push(tweetObject);

          const result = await user.save();

          console.log(data);

          const tweet = async () => {
            try {
              const tweetResult = await twitterClient.v2.tweet(data);

              if (!tweetResult.errors) {
                user.total_CP = user.total_CP - 1;
                const resultCP = await user.save();

                console.log("Tweet Successful, CP deducted!!");
              }
            } catch (e) {
              console.log("Error tweeting:", e);
            }
          };

          await tweet();
        } catch (err) {
          console.log("Error generating AI response:", err);
        }
      };

      await generate();
      setTimeout(findAll, user.tweetInterval);
    }
  } catch (err) {
    console.log("Error fetching users:", err.message);
  }
};

findAll();

// Event listener for successful MongoDB connection
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});
