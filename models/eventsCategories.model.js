import mongoose from 'mongoose';

export const CategoriesSchema = new mongoose.Schema({
  category: String,
  title: String,
  description: String,
  image: String,
});

const Categories = mongoose.model('Categories', CategoriesSchema);

export default Categories;
