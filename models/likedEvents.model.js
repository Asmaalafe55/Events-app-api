import mongoose from 'mongoose';

export const LikedEventsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Events' },
  likedAt: { type: Date, default: Date.now },
});

const LikedEvents = mongoose.model('LikedEvents', LikedEventsSchema);

export default LikedEvents;
