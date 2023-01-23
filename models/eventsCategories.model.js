import mongoose from 'mongoose';
import data from '../data/data.json' assert { type: 'json' };

const CategoriesSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  image: String,
});

const Categories = mongoose.model('Categories', CategoriesSchema);

Categories.insertMany(data.events_categories, (error, data) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Data saved successfully!');
  }
});

export default Categories;
