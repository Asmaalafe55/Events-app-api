import Events from '../models/events.model';

export default async function getEvents(req, res, next) {
  try {
    const events = await Events.find();
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
}

// export async function getEventsByCategoty(req, res, next) {
//   try {
//     const events = await Events.find({ category: req.params.category });
//     res.status(200).json(events);
//   } catch (error) {
//     next(error);
//   }
// }

// export async function getEventById(req, res, next) {
//   try {
//     const event = await Events.findById(req.params.id);
//     res.status(200).json(event);
//   } catch (error) {
//     next(error);
//   }
// }

export async function createEvent(req, res, next) {
  try {
    const event = await Events.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await Events.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    await Events.findByIdAndDelete(req.params.id);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
}
