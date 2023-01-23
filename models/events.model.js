import mongoose from 'mongoose';
import data from '../data/data.json' assert { type: 'json' };

const EventsSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  image: String,
});
const Events = mongoose.model('Events', EventsSchema);

Events.insertMany(data.allEvents, (error, data) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Data saved successfully!');
  }
});

export default Events;
