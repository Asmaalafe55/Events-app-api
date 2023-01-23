import Categories from '../models/eventsCategories.models';

export default async function addCategory(request, response) {
  const category = new Categories(request.body);

  try {
    await category.save();
    response.send(category);
  } catch (error) {
    response.status(500).send(error);
  }
}

export async function getCategories(request, response) {
  try {
    const categories = await Categories.find();
    response.send(categories);
  } catch (error) {
    response.status(500).send(error);
  }
}
