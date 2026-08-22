import mongoose from 'mongoose';

export const CategoriesSchema = new mongoose.Schema({
  category: String,
  title: String,
  titleHe: { type: String, default: '' },
  titleAr: { type: String, default: '' },
  description: String,
  descriptionHe: { type: String, default: '' },
  descriptionAr: { type: String, default: '' },
  image: String,
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
});

const Categories = mongoose.model('Categories', CategoriesSchema);

export default Categories;
