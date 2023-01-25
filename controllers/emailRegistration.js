import Events from '../models/events.model.js';

export default async function addEmail(req, res) {
  const { email, eventId } = req.body;

  const event = await Events.findById(eventId);
  if (!event) {
    return res.status(400).json({ error: 'Event does not exist' });
  }

  const emailExists = await event.emails_registered.find(
    (e) => e.email === email
  );
  if (emailExists) {
    return res.status(400).json({ error: 'Email already exists' });
  } else {
    event.emails_registered.push({ email });
    await event.save();
    return res.status(200).json({ message: 'Email added' });
  }
}
