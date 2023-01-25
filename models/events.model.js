import mongoose from 'mongoose';
import data from '../data/data.json' assert { type: 'json' };
import { CategoriesSchema } from './eventsCategories.model.js';

const EventsSchema = new mongoose.Schema({
  _id: false,
  id: String,
  title: String,
  category: CategoriesSchema,
  description: String,
  image: String,
  emails_registered: [String],
});
const Events = mongoose.model('Events', EventsSchema);

export default Events;
