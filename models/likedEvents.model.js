import mongoose from 'mongoose';

const LikedEventsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    eventId: { type: String, required: true },
  },
  { timestamps: true }
);

LikedEventsSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const LikedEvents = mongoose.model('LikedEvents', LikedEventsSchema);

export default LikedEvents;
