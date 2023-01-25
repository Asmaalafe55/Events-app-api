import mongoose from 'mongoose';
import data from '../data/data.json' assert { type: 'json' };

export const CategoriesSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  image: String,
});

const Categories = mongoose.model('Categories', CategoriesSchema);

export default Categories;
