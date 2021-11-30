const express = require('express');
const wrapAsync = require("../utils/WrapAsync.js");
const Campground = require("../Models/model.js");
const Review = require("../Models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("../schemas.js");


function validateReview(req, res, next) {

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }

};
const router = express.Router({ mergeParams: true });


router.post("/", validateReview, wrapAsync(async (req, res) => {
    const currCampground = await Campground.findById(req.params.id);
    const currReview = new Review(req.body.review);
    currCampground.reviews.push(currReview);
    await currCampground.save();
    await currReview.save();
    res.redirect(`/campgrounds/${currCampground._id}`);
}));

router.delete("/:reviewid", wrapAsync(async (req, res) => {
    const { id, reviewid } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewid } })
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/campgrounds/${id}`);
}));


module.exports = router;