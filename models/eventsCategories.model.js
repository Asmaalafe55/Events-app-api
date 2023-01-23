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

// Find all documents
// Categories.find((error, data) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log(data);
//   }
// });

// Find a specific document by its _id
// Model.findById('5f5a2c3e9c3c9a2f3a8c2b5f', (error, data) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log(data);
//   }
// });

export default Categories;
