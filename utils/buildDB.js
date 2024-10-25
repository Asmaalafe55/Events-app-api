import mongoose from 'mongoose'; // Import Mongoose for MongoDB interaction
import { config } from 'dotenv'; // Import config from dotenv to load environment variables

import Categories from '../models/eventsCategories.model.js'; // Import Categories model
import Events from '../models/events.model.js'; // Import Events model
import data from '../data/data.json' assert { type: 'json' }; // Import data from a JSON file

config(); // Load environment variables from a .env file

// Function to handle errors
function handleError(err) {
  console.error(err); // Log the error
  process.exit(1); // Exit the process with an error code
}

// Retrieve environment variables for MongoDB connection
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const cluster = process.env.CLUSTER;

// Connect to MongoDB using the provided credentials and cluster information
mongoose.connect(
  `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`
);

// Get the database connection
const db = mongoose.connection;
// Handle connection errors
db.on('error', console.error.bind(console, 'connection error: '));
// Once the connection is open, execute the following code
db.once('open', async () => {
  try {
    // Drop the existing Categories collection if it exists
    await Categories.collection.drop();
    console.log('Categories collection dropped');
    // Drop the existing Events collection if it exists
    await Events.collection.drop();
    console.log('Events collection dropped');
  
    
    // Insert new data into the Categories collection
    await Categories.insertMany(data.events_categories, (error, data) => {
      if (error) {
        console.log(error); // Log any errors during the insertion
      } else {
        console.log('Categories data saved successfully!'); // Log success message
      }
    });

    // Insert new data into the Events collection, assigning a random category to each event
    await Events.insertMany(
      data.allEvents.map((e) => {
        const index = Math.floor(Math.random() * 3); // Generate a random index for category
        e.category = data.events_categories[index]; // Assign a random category to the event
        return e;
      }),
      (error, data) => {
        if (error) {
          console.log(error); // Log any errors during the insertion
        } else {
          console.log('Events data saved successfully!'); // Log success message
        }
      }
    );
  } catch (err) {
    return handleError(err); // Handle any errors that occur during the process
  }

  console.log('Connected successfully'); // Log a success message when connected to the database
});
