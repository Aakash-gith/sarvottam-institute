import mongoose from 'mongoose';
import Course from './models/Course.js';

const MONGO_URI = 'mongodb+srv://arsirpersonal_db_user:DbEngineer@aakash20.bmnyus7.mongodb.net/SarvottamDB';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const res = await Course.updateMany(
      { title: 'test' },
      { '$set': { classLevel: 'Class 10' } }
    );
    console.log('Update result:', res);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
