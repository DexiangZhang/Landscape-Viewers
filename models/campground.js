const { func } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review");

// for shortcut 
const schema = mongoose.Schema;

const campGroundSchema = new schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"   // objectid from the review modele js file
        }
    ]
});

campGroundSchema.post("findOneAndDelete", async function (doc) {
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews,
            }
        })
    } 
})

module.exports = mongoose.model("Campground", campGroundSchema);





