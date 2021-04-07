const path = require("path");
const mongoose = require("mongoose");
const campGround = require("../models/campground.js");
const cities = require("./cities");

const {places, descriptors} = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp", { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true,})  
.then( () => {
    console.log("mongo connections open");
})
.catch( (err) => {
    console.log("mongo error");
    console.log(err);
})

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await campGround.deleteMany({});
    
    for(let i=0; i< 50; i++) {
        let randomCity = Math.floor(Math.random() *1000 );
        let price = Math.floor(Math.random() * 20) + 10;
        let camp = new campGround({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
            image: "https://source.unsplash.com/collection/1758324/640x500",
            description: "The purpose of our lives is to be happy.",
            price,
        });

        await camp.save();
    }
};

seedDB().then( () => {
    mongoose.connection.close();
});