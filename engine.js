require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { format } = require("date-fns");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnect");

const API_ENDPOINT = "us-central1-aiplatform.googleapis.com";
const PROJECT_ID = "websapp-385302";
const MODEL_ID = "text-bison@001";

const accessToken =
  "ya29.a0AfB_byBAgnnRN_ZHdORAvSuq1nJQY27LI7F5fC006NcxsvKfXUR0DsTsoSj6bvjloSt1CaFORyymuf062SBGlALnxkHh2RkBlAmRTZPAL_PYu-GuImYV77h12zX-aAxVKM0OToMluxFeVWsmoePb5He7g6DamPIHVgCKHQaCgYKAUkSARMSFQHsvYlsmJ27CVT5Li7DwVN4okcW_w0173";

// Connect to MongoDB
connectDB();

const findAll = async () => {
  try {
    const UsersDB = require("./models/userModel");
    const users = await UsersDB.find({ botOn: true, total_CP: { $ne: 0 } });

    users.forEach(async (user) => {
      const tweetTextArray = user.tweet.map((text) => text.tweetText.trim());
      console.log(user.prompt);
      console.log(`${user.username} active`);
      const { TwitterApi } = require("twitter-api-v2");

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
          const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          };

          const data = {
            instances: [
              {
                content: `${user.prompt} `,
              },
            ],
            parameters: {
              temperature: 0.3,
              maxOutputTokens: 256,
              topP: 0.8,
              topK: 40,
            },
          };

          const url = `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:predict`;

          axios
            .post(url, data, { headers })
            .then(async (response) => {
              const data1 = response.data.predictions[0].content;
              const currentDateAndTime = format(
                new Date(),
                "yyyy-MM-dd HH:mm:ss"
              );

              const tweetObject = {
                tweetText: data1,
                time: currentDateAndTime,
              };

              user.tweet.push(tweetObject);
              const result = await user.save();

              console.log(data1);

              const tweetResult = await twitterClient.v2.tweet(data1);

              if (!tweetResult.errors) {
                user.total_CP = user.total_CP - 1;
                const resultCP = await user.save();

                console.log("Tweet Successful, CP deducted!!");
              }
            })
            .catch((error) => {
              console.error("API error:", error.message);
            });
        } catch (err) {
          console.log("Error generating AI response:", err);
        }
      };

      await generate();

      setInterval(async () => {
        await findAll();
      }, user.tweetInterval);
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
