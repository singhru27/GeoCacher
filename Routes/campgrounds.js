const express = require('express');
const router = express.Router();
const ejsMate = require("ejs-mate");
const wrapAsync = require("../utils/WrapAsync.js");
const campgroundController = require('../Controllers/campgrounds.js');
const { isLoggedIn, validateCampground, verifyOwner } = require("../Middleware/middleware.js");
const { upload } = require("../AWS/S3.js");

router.route("/")
    .get(wrapAsync(campgroundController.index))
    // .post(isLoggedIn, validateCampground, wrapAsync(campgroundController.createCampground));
    .post(isLoggedIn, upload.array('image'), (req, res) => {
        res.send(req.body);
    });

router.get("/new", isLoggedIn, campgroundController.showNewForm);

router.route("/:id")
    .get(wrapAsync(campgroundController.showCampground))
    .put(isLoggedIn, verifyOwner, wrapAsync(campgroundController.editCampground))
    .delete(isLoggedIn, verifyOwner, wrapAsync(campgroundController.deleteCampground))

router.get("/:id/edit", isLoggedIn, verifyOwner, wrapAsync(campgroundController.showEditForm));

module.exports = router;