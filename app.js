const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const {campgroundSchema, reviewSchema} = require("./schemas.js");
const campGround = require("./models/campground.js");
const catchAsync = require("./utilties/catchAsync.js");
const ExpressError = require("./utilties/ExpressError.js");
const Review = require("./models/review.js");


mongoose.connect("mongodb://localhost:27017/yelp-camp", { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true,})  
.then( () => {
    console.log("mongo connection open");
})
.catch( (err) => {
    console.log("mongo error");
    console.log(err);
})

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

const validateCampground = (req, res, next) => {
    
    let {error} = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400);

    } else {
        next();     // if successfull, go the third argument (success code part)
    }
}

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);

    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400);

    } else {
        next();     // if successfull, go the third argument (success code part)
    }
}


app.get('/', (req, res) => {
    res.render("home.ejs");
});

app.get("/campgrounds", catchAsync(async (req, res) => {
    let campgrounds = await campGround.find({});
    res.render("campgrounds/index", {campgrounds});
}));

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new.ejs");
});



app.post("/campgrounds", validateCampground, catchAsync(async (req, res) => {

    let campground = new campGround(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}));

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    let campground = await campGround.findById(req.params.id).populate("reviews");
    res.render("campgrounds/show.ejs", {campground});
}));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    let campground = await campGround.findById(req.params.id);
    res.render("campgrounds/edit.ejs", {campground});
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
    let {id} = req.params;
    let campground = await campGround.findByIdAndUpdate(id, { ...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete("/campgrounds/:id/", catchAsync(async (req, res) => {
    let {id} = req.params;

    await campGround.findByIdAndDelete(id);

    res.redirect("/campgrounds");
}));

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
    let campground = await campGround.findById(req.params.id);

    // since html, our name attribute is "review[..]" so it always under "review"
    let review = new Review(req.body.review);

    campground.reviews.push(review);
    await review.save();
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
}))


app.delete(`/campgrounds/:id/reviews/:reviewId`, catchAsync(async (req, res) => {
    
    // $pull the operator that pull specific item that match to what you refer

    let {id, reviewId} = req.params;

    // we find that match id in the "reviews" which is bunch of id, and pull that out from
    // the review and update the object with rest of id array,
    await campGround.findByIdAndUpdate(id, {$pull: { reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    let {statusCode = 500} = err;
    if(!err.message)
        err.message = "Sorry, something went wrong! Please try again later!";
    res.status(statusCode).render("error.ejs", {err});
})

app.listen(8080, () => {
    console.log("listening port on 3000")
});