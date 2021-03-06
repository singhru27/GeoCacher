const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/WrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const geocacheRoutes = require("./Routes/geocaches.js");
const reviewsRoutes = require("./Routes/reviews.js");
const usersRoutes = require("./Routes/users.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");
const https = require("https");
const fs = require("fs");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Setup configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // support encoded bodies
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
// Setting Views directory
app.set("views", path.join(__dirname, "/Views"));
// Enabling PUT and DELETE requests
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "Public")));
// Sanitizing mongo inputs
app.use(mongoSanitize());
// Using helmet security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
// Connection to the Mongo database
const password = process.env.MONGO_PASSWORD;

// Configuration file for the session
const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: `mongodb+srv://singhru:${password}@rsdb.bodim.mongodb.net/Campsites?retryWrites=true&w=majority`,
    secret: process.env.SESSION_PASS,
  }),
  secret: process.env.SESSION_PASS,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(flash());
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose
  .connect(
    `mongodb+srv://singhru:${password}@rsdb.bodim.mongodb.net/Campsites?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connection Accepted");
  })
  .catch((e) => {
    console.log(e);
    console.log("Connection Refused");
  });

// Middleware that handles flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Router breakout for all Geocache based pages
app.use("/geocaches", geocacheRoutes);
// Router breakout for all review based pages
app.use("/geocaches/:id/reviews", reviewsRoutes);
// Router breakout for all user based pages
app.use("/", usersRoutes);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  if (!err.status) {
    err.status = 500;
  }
  res.status(err.status).render("error.ejs", { err });
});

// // Listening to port 3001
// app.listen(3001, () => {
//   console.log("Server is Running");
// });
const privateKey = fs.readFileSync("privkey.pem", "utf8");
const certificate = fs.readFileSync("cert.pem", "utf8");
const ca = fs.readFileSync("chain.pem", "utf8");

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

https.createServer(credentials, app).listen(3001, () => {
  console.log("Listening...");
});
