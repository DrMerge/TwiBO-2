require("dotenv").config();
const express = require("express");
const { format } = require("date-fns");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnect");

// Connect to MongoDB
connectDB();

const findAll = async () => {
  try {
    const UsersDB = require("./models/userModel");
    const users = await UsersDB.find();

    users.forEach((user) => {
      if (user.botOn === true && user.total_CP !== 0) {
        const { TwitterApi } = require("twitter-api-v2");

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
            const currentDateAndTime = format(
              new Date(),
              "yyyy-MM-dd HH:mm:ss"
            );

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

            tweet();
          } catch (err) {
            console.log("Error generating AI response:", err);
          }
        };

        generate();

        setInterval(findAll, user.tweetInterval);
      } else {
        console.log(
          `Bot not active for ${user.username} BOTSTAT: ${user.botOn}   BOT CP: ${user.total_CP}`
        );
      }
    });
  } catch (err) {
    console.log("Error fetching users:", err);
  }
};

findAll();

// Event listener for successful MongoDB connection
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});
