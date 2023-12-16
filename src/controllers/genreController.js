const Genre = require("../models/genre");
const asyncHandler = require("express-async-handler");
const Book = require('../models/book');
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenre = await Genre.find().sort({Name: 1}).exec();
  res.render('../src/views/genre_list', {
    title: "Genre List", 
    genre_list: allGenre,
  })
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  //get details of genre and all associated book (in parallel)
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(), 
    Book.find({ genre: req.params.id}, "title summary").exec(),
  ])

  if (genre == null){
    //no result 
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("../src/views/genre_detail", {
    title: "Genre Detail",
    genre: genre, 
    genre_books: booksInGenre,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("../src/views/genre_form", {title: "Create Genre"});
};

// Handle Genre create on POST.
exports.genre_create_post = [
  //validate and sanitize the name field
  body("name", "Genre name must contain at least 3 characters").trim().isLength({min: 3}).escape(),

  //process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    //extract the validation errors from a request.
    const errors = validationResult(req);

    //create a genre object with the escaped and trimmed data 
    const genre = new Genre({name: req.body.name});

    if (!errors.isEmpty()){
      //There are error. Render the form again with sanitized values/error messages.
      res.render("../src/views/genre_form", {
        title: "Create Genre", 
        genre: genre, 
        errors: errors.array(),
      });
      return; 
    } else {
      //Data from form is valid.
      //Check if Genre with same name already exists. 
      const genreExits = await Genre.findOne({name : req.body.name}).collation({locale:"en", strength: 2}).exec();
      if (genreExits) {
        //genre exists, redirect to its details page.
        res.redirect(genreExits.url);
      } else {
        await genre.save();
        //New genre saved. Redirect to genre details page.
        res.redirect(genre.url);
      }
    }
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }).exec()
  ])
  if (booksInGenre.length > 0){
      res.render("../src/views/genre_delete", {
      title: "Delete Genre", 
      genre: genre,
      booksInGenre: booksInGenre,
    });
    return
  }

  res.render("../src/views/genre_delete", {
    title: "Delete Genre", 
    genre: genre
  })
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();
  await Genre.findByIdAndDelete(req.params.id)
  res.redirect("/catalog/genres");
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
});

// Handle Genre update on POST.
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
});
