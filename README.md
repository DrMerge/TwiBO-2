#<h1> TwiBO-2# Twibo - Twitter Bot<h1>

Twibo is a Twitter bot application that uses AI-powered tweet generation to post creative and engaging tweets on users' Twitter accounts. This bot is designed to automate the process of tweeting while providing users with control over the content and frequency of tweets.

## Features

- AI-Powered Tweet Generation: Twibo uses the OpenAI GPT-3.5 model to generate unique and compelling tweets based on user prompts.
- Tweet Scheduling: Users can schedule AI-generated tweets to be automatically posted at specific intervals on their Twitter accounts.
- Twitter API Integration: Twibo integrates with the Twitter API to post tweets on behalf of users.
- User Management: The application allows users to sign up, log in, and manage their Twitter bot settings.

## Requirements

- Node.js and npm
- MongoDB database
- OpenAI API key
- Twitter API credentials (appKey, appSecret, accessToken, accessSecret, and bearerToken)

## Getting Started

1. Clone the repository and navigate to the project directory.
2. Install dependencies by running: `npm install`.
3. Create a `.env` file in the project root and provide the following variables:

   ```plaintext
   MONGODB_URI=your-mongodb-uri
   OPENAI_API_KEY=your-openai-api-key
   ```

4. Obtain your Twitter API credentials and add them to the `.env` file:

   ```plaintext
   TWITTER_APP_KEY=your-twitter-app-key
   TWITTER_APP_SECRET=your-twitter-app-secret
   TWITTER_ACCESS_TOKEN=your-twitter-access-token
   TWITTER_ACCESS_SECRET=your-twitter-access-secret
   TWITTER_BEARER_TOKEN=your-twitter-bearer-token
   ```

5. Run the application: `npm start`.

## Usage

1. Sign up for a new account or log in to the TwibO app if you already have one.
2. On the dashboard, provide a prompt to generate an AI-powered tweet.
3. Schedule the tweet to be posted at the desired time interval.
4. Twibo will automatically generate and post tweets on your Twitter account at the scheduled intervals.

## Code Structure

- `config/dbConnect.js`: Connects to the MongoDB database.
- `models/userModel.js`: Defines the User schema for MongoDB.
- `gpt3Client.js`: Contains functions to interact with the OpenAI GPT-3.5 API.
- `app.js`: Main application file that handles tweet generation, scheduling, and Twitter API integration.

## Dependencies

- Express.js for the server and routing.
- Mongoose for MongoDB integration.
- dotenv for environment variable management.
- date-fns for date manipulation.

## License

This project is licensed under the MIT License. Feel free to use, modify, and distribute the code as per the terms of the license.

## Contributing

Contributions are welcome! If you find any issues or want to add new features, please open an issue or submit a pull request.

## Acknowledgments

- Twibo is powered by the creativity of the OpenAI GPT-3.5 model and Twitter's API.

## Contact

For questions or support, you can contact us at support@twibo.com.

---

Replace the placeholders (e.g., `your-mongodb-uri`, `your-openai-api-key`, etc.) with the actual information specific to your application. Provide clear instructions for setting up and running the application. Additionally, include any legal notices, privacy policy, or terms of service as necessary for your Twitter bot SAAS application.
