const Notes = require('../models/Notes');
const asyncHandler = require('express-async-handler');
const colors = require('colors');
//desc   add note
//access   private
exports.addNote = asyncHandler(async (req, res, next) => {
  const notes = await Notes.create(req.body);
  res.status(201).json({ success: true, data: notes });
});

//desc   delete notes
//access   private
exports.deleteNote = asyncHandler(async (req, res, next) => {
  const notes = await Notes.findByIdAndRemove(req.params.id);
  if (!notes) {
    next(err);
  }
  res.status(200).json({ success: true, data: notes });
});

//desc   add notes
//access   private
exports.updateNote = asyncHandler(async (req, res, next) => {
  const notes = await Notes.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!notes) {
    next(err);
  }
  res.status(200).json({ success: true, data: notes });
});

//desc   get notes and also get notes for a particular user.
//access   private
exports.getNotes = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];

  removeFields.forEach((params) => delete reqQuery[params]);

  let query;
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  //The logic to get all notes for a user and the logic to just get all notes
  if (req.params.userId) {
    query = Notes.find({
      user: req.params.userId,
    });
  } else {
    query = Notes.find(JSON.parse(queryStr));
  }

  //creating the select feature
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  //creating the sorting feature
  if (req.query.sort) {
    const fields = req.query.sort.split(',').join(' ');
    query = query.sort(fields);
  }

  //for pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  const notes = await query;
  res.status(200).json({ success: true, data: notes });
});

//desc   get a note
//access   private
exports.getNote = asyncHandler(async (req, res, next) => {
  const notes = await Notes.findById(req.params.id);
  if (!notes) {
    next(err);
  }
  res.status(200).json({ success: true, data: notes });
});
