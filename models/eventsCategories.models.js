import mongoose from 'mongoose';

const CategoriesSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  image: String,
});
const Categories = mongoose.model('Categories', CategoriesSchema);

Categories.insertMany(
  [
    {
      id: 'london',
      title: 'London',
      description:
        'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem',
      image:
        'https://user-images.githubusercontent.com/92914100/209211045-2928deb8-5b2f-4d93-9d73-5ac98e8031ee.jpg',
    },
    {
      id: 'san-francisco',
      title: 'San Francisco',
      description:
        'corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate.',
      image:
        'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
    },
    {
      id: 'barcelona',
      title: 'Barcelona',
      description:
        'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscisfa.',
      image:
        'https://images.unsplash.com/photo-1579282240050-352db0a14c21?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=652&q=80',
    },
  ],
  (error, data) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Data saved successfully!');
    }
  }
);

export default Categories;
