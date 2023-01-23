import Categories from '../models/eventsCategories.models';

export default async function (request, response) {
  const category = new Categories(request.body);

  try {
    await category.save();
    response.send(category);
  } catch (error) {
    response.status(500).send(error);
  }
}
