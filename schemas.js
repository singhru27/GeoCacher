const Joi = require("joi");
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required(),
        description: Joi.string().required(),
        image: Joi.number().required(),
        location: Joi.string().required()

    }).required()
})