import { Schema, model, Document, Types } from 'mongoose';


interface IUser extends Document {
  username: string;
  email: string;
  thoughts: Types.ObjectId[];
  friends: Types.ObjectId[];
  friendCount: number;
}

const userSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: /.+\@.+\..+/ // Regex for basic email format validation
  },
  thoughts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Thought'
    }
  ],
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
} ,
{
  toJSON: {
    virtuals: true,
  },
  id: false
});

// Virtual for retrieving friend count
userSchema.virtual('friendCount').get(function() {
  return this.friends.length;
});

const User = model<IUser>('User', userSchema);

// Populate user collection if empty to prevent duplicates
User.find({})
  .exec()
  .then(async collection => {
    if (collection.length === 0) {
      const results = await User.insertMany(
        [
          {
            username: 'john_doe',
            email: 'john.doe@example.com',
            thoughts: [],
            friends: [],
          },
          {
            username: 'jane_smith',
            email: 'jane.smith@example.com',
            thoughts: [],
            friends: [],
          },
          {
            username: 'mary_jane',
            email: 'mary.jane@example.com',
            thoughts: [],
            friends: [],
          },
          {
            username: 'alice_wonder',
            email: 'alice.wonder@example.com',
            thoughts: [],
            friends: [],
          },
          {
            username: 'bob_builder',
            email: 'bob.builder@example.com',
            thoughts: [],
            friends: [],
          }
        ]
      );
      console.log('Users inserted', results);
    } else {
      console.log('User collection already populated');
    }
  })
  .catch(err => console.log(err));

export default User;
