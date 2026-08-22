import Categories from '../models/eventsCategories.model.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

export const getCategories = catchAsync(async (req, res) => {
  const categories = await Categories.find();
  res.send(categories);
});

export const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const filter = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { category: id }] }
    : { category: id };

  const category = await Categories.findOne(filter);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(category);
});

export const addCategory = catchAsync(async (req, res) => {
  const exists = await Categories.findOne({ category: req.body.category });
  if (exists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category already exists');
  }
  const category = await Categories.create(req.body);
  res.status(httpStatus.CREATED).send(category);
});

export const updateCategory = catchAsync(async (req, res) => {
  const category = await Categories.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(category);
});

export const deleteCategory = catchAsync(async (req, res) => {
  const category = await Categories.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(category);
});
