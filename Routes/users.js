const express = require('express');
const wrapAsync = require("../utils/WrapAsync.js");
const User = require("../Models/user.js");
const passport = require("passport");
const router = express.Router({ mergeParams: true });


router.get("/register", (req, res) => {
    res.render('users/register.ejs');
});

router.post("/register", wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username: username, email: email });
        const registeredUser = await User.register(newUser, password);
        req.flash('success', "Welcome to CampFinder!");
        res.redirect("/campgrounds");
    } catch (e) {
        req.flash('error', e.message);
        res.redirect("/register");
    }
}));

router.get("/login", (req, res) => {
    res.render('users/login.ejs');
});

router.post("/login", passport.authenticate('local', { failureFlash: true, failureRedirect: "/login" }), (req, res) => {
    req.flash("success", "Succesfully logged in");
    res.redirect("/campgrounds");

})

module.exports = router;