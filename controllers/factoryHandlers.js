const catchAsync = require("../utils/catchAsync");

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const data = {
      ...req.body,
      author: req.user.id,
    };

    const newRecord = await Model.create(data);
    res.status(201).json({ data: newRecord });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const record = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!record) {
      return next(new AppErr("No record found with that ID", 404));
    }
    res.status(200).json({ data: record });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const record = await Model.findByIdAndDelete(id);

    if (!record) {
      return next(new AppErr("No record found with that ID", 404));
    }

    res.status(200).json({
      status: "Record successfully deleted",
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let record;
    const { id } = req.params;
    record = await Model.findById(id);
    if (populateOptions) {
      record = await Model.findById(id).populate(populateOptions);
    }

    if (!record) {
      return next(new AppErr("No record found with that ID", 404));
    }

    // const post = user._doc;
    res.status(200).json({ data: record });
  });

exports.getAll = (Model) =>
  catchAsync(async (_req, res, _next) => {
    const record = await Model.find().sort({ createAt: -1 });
    res.status(200).json({ results: record.length, data: record });
  });

exports.likeOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const userId = req.user.id;

    const record = await Model.findById(id);

    if (!record) {
      return next(new AppErr("No record found with that ID", 404));
    }

    const existingUser = record.likes.includes(userId);

    if (existingUser) {
      record.likes = record.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      record.likes.push(userId);
    }
    await record.save();

    res.status(200).json({ data: record });
  });
