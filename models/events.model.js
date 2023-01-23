import mongoose from 'mongoose';

const EventsSchema = new mongoose.Schema({
  id: {
    type: String,
    default: 'london',
  },
  title: {
    type: String,
    default: 'London',
  },
  description: {
    type: String,
    default:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eius',
  },
  image: {
    type: String,
    default:
      'http://https://user-images.githubusercontent.com/92914100/209211045-2928deb8-5b2f-4d93-9d73-5ac98e8031ee.jpg',
  },
});
const Events = mongoose.model('Events', EventsSchema);

export default Events;
