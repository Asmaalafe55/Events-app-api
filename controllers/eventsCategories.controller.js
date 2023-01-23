import Categories from '../models/eventsCategories.model';

export default async function getCategories(request, response) {
  try {
    const categories = await Categories.find();
    response.send(categories);
  } catch (error) {
    response.status(500).send(error);
  }
}

export async function getCategoryById(request, response) {
  try {
    const category = await Categories.findById(request.params.id);
    response.send(category);
  } catch (error) {
    response.status(500).send(error);
  }
}

export async function addCategory(request, response) {
  const category = new Categories(request.body);

  try {
    await category.save();
    response.send(category);
  } catch (error) {
    response.status(500).send(error);
  }
}

export async function updateCategory(request, response) {
  try {
    const category = await Categories.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true }
    );
    response.send(category);
  } catch (error) {
    response.status(500).send(error);
    console.log(error);
  }
}

export async function deleteCategory(request, response) {
  try {
    const category = await Categories.findByIdAndDelete(request.params.id);
    response.send(category);
  } catch (error) {
    response.status(500).send(error);
  }
}
