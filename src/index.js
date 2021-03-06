const http = require("http");
const cors = require("cors");
const config = require('./config.json');
const cookieParser = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose")
const bodyParser = require("body-parser");
const passport = require("passport");
const logger = require("morgan");
const path = require('path');

require("dotenv").config();
const session = require("express-session");

mongoose
  .connect(process.env.MONGODB_URI ||"mongodb://localhost/boilerplate-app", {
    useNewUrlParser: true
  })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
    //console.log(path.join(__dirname, "../client/public", "images", "favicon.ico"))
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("../package.json").name;

const app = express();
app.server = http.createServer(app);

// logger
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// View engine
// app.use(express.static(path.join(__dirname, "../client/build")));
// app.use(favicon(path.join(__dirname, "../client/public", "favicon.ico")));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

const MongoStore = require("connect-mongo")(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 24 * 60 * 60
    },
    reserve: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

app.use(passport.initialize())
app.use(passport.session())

require("./configs/passport");

app.server.listen(process.env.PORT || config.port, () => {
	console.log(`Started on port ${app.server.address().port}`);
});

const index = require('./routes/index')
app.use("/",index);

const authRoutes =require("./routes/auth")
app.use("/api/auth",authRoutes);

const userRoutes =require("./routes/user")
app.use("/api/user",userRoutes);


app.use((req, res) => {
  // If no routes match, send them the React HTML.
  res.sendFile(__dirname + "/client/build/index.html");
});

export default app;
