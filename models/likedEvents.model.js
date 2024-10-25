import mongoose from 'mongoose';

const LikedEventsSchema = new mongoose.Schema({
  userId: String,
  eventId: String,
});
const LikedEvents = mongoose.model('LikedEvents', LikedEventsSchema);

export default LikedEvents;
