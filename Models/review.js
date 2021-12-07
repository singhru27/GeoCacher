const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    body: String,
    rating: Number,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
})

module.exports = mongoose.model("Review", reviewSchema);