import mongoose from 'mongoose';

const LikedEventsSchema = new mongoose.Schema({
  userId: String,
  eventId: String,
});
// const LikedEventsSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
//   likedEvents: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Events',
//     },
//   ],
// });

const LikedEvents = mongoose.model('LikedEvents', LikedEventsSchema);

export default LikedEvents;
