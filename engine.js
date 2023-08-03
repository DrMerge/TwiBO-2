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
  "ya29.a0AbVbY6PAT7hLugnb8ue6Vcgzk9Hooc1OM17PQgfbnP5DtDDMhhttjyBglXugw7_9Qtk2CNmW427KkuxWFIeOGAd1cPOr_45hfoZmQ3e-yjcKiAni8swPoUhroJxj7NETH2JnFcSvKCfGs1diX2IpPqb5vv3LSDYWpEd60C4V6VZ24bS8DXZvd8ZPrZjcObEUGrlyG0DL9kOuoaJUfuIZaaPW5HBHUkEgjVqnKK-WdQM9vVaFIfOkG13fJH4i9ZRrGE1BpTlTnX4KwJ1GKnYzfzaFXxsE47aGodiv_Rzn9jJtDP0xDprgFUgz8YcP9pudA_fT6Htgaz_ewGc2EN6QTlpaJvnHvfZtTS_0u6b6qOjc5t5FWW9g5X8HVC0QPrMV5uEhK9agBLZ4Q9rdVMPHarO3iQaCgYKAV4SARMSFQFWKvPl5MWLLXZvc9xQzYFpOixyWw0417";

// Connect to MongoDB
connectDB();

const findAll = async () => {
  try {
    const UsersDB = require("./models/userModel");
    const users = await UsersDB.find({ botOn: true, total_CP: { $ne: 0 } });

    users.forEach(async (user) => {
      const tweetTextArray = user.tweet.map((text) => text.tweetText.trim());

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
                content: `${user.prompt} without repeating any of these, ${tweetTextArray} `,
              },
            ],
            parameters: {
              temperature: 1,
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

      generate();
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
