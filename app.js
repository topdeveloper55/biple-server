const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  cors = require("cors"),
  userRoutes = require("./routes/user"),
  communityRoutes = require("./routes/community"),
  bodyParser = require('body-parser');

require("dotenv")
  .config();
//Connect to database
try {
  mongoose.connect(`mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@test.tp7vf.mongodb.net/?retryWrites=true&w=majority`, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
  console.log("connected to db");
} catch (error) {
  handleError(error);
}
process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
});

app.use(express.static("./public"))
app.use(cors({
  origin: ['http://localhost:3000', 'https://biples.netlify.app', 'https://biples-beta.netlify.app']
}))
// parse requests of content-type - application/json

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

//using user route
app.use("/biples/auth", userRoutes);
app.use("/biples/community", communityRoutes)

//setup server to listen on port 8080
app.listen(process.env.PORT || 8080, () => {
  console.log("Server is live on port 8080");
})