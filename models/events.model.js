import mongoose from 'mongoose';
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
