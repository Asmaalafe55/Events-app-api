import mongoose from 'mongoose';

const CategoriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lucky_number: {
    type: Number,
    default: 0,
  },
});
const Categories = mongoose.model('Categories', CategoriesSchema);

export default Categories;
