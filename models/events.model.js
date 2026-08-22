import mongoose from 'mongoose';
import { CategoriesSchema } from './eventsCategories.model.js';

const EventsSchema = new mongoose.Schema(
  {
    _id: false,
    id: { type: String, required: true },
    title: String,
    titleHe: { type: String, default: '' },
    titleAr: { type: String, default: '' },
    category: CategoriesSchema,
    description: String,
    descriptionHe: { type: String, default: '' },
    descriptionAr: { type: String, default: '' },
    image: String,
    emails_registered: { type: [String], default: [] },
    likes: { type: Number, default: 0 },
    date: Date,
    time: { type: String, default: '' },
    venue: { type: String, default: '' },
    venueHe: { type: String, default: '' },
    venueAr: { type: String, default: '' },
    city: { type: String, default: '' },
    price: { type: String, default: 'Free' },
    organizer: { type: String, default: '' },
    type: { type: String, default: 'event' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    wheelchairAccessible: { type: Boolean, default: true },
    capacity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

EventsSchema.index({ id: 1 }, { unique: true });

const Events = mongoose.model('Events', EventsSchema);

export default Events;
