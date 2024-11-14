import express from 'express';
import db from './config/connection.js'; // Assuming db connection is set up
// Importing the User model
import { User } from './models/index.js';
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Creates a new User
app.post('/user', async (req, res) => {
    try {
        const { username, email } = req.body;
        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email are required' });
        }
        const newUser = new User({ username, email });
        const savedUser = await newUser.save();
        return res.status(201).json(savedUser);
    }
    catch (err) {
        console.log('Uh Oh, something went wrong', err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});
// Finds all users
app.get('/user', async (_req, res) => {
    try {
        const users = await User.find({});
        return res.status(200).json(users);
    }
    catch (err) {
        console.log('Uh Oh, something went wrong', err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});
// Finds the first matching document by username and returns it.
app.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
    }
    catch (err) {
        console.log('Uh Oh, something went wrong', err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});
// Finds the first matching document by username and deletes it.
app.delete('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const deletedUser = await User.findOneAndDelete({ username });
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ message: `Deleted: ${deletedUser.username}` });
    }
    catch (err) {
        console.log('Uh Oh, something went wrong', err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});
// Add a friend
app.post('/user/:username/friends/:friendUsername', async (req, res) => {
    try {
        const { username, friendUsername } = req.params;
        const user = await User.findOne({ username });
        const friend = await User.findOne({ username: friendUsername });
        if (!user || !friend) {
            return res.status(404).json({ error: 'User or friend not found' });
        }
        // Add friend to user's friend list if not already a friend
        if (!user.friends.includes(friend._id)) {
            user.friends.push(friend._id);
            await user.save();
            return res.status(200).json(user);
        }
        else {
            return res.status(400).json({ error: 'Already friends' });
        }
    }
    catch (err) {
        console.log('Uh Oh, something went wrong', err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});
// Remove a friend
app.delete('/user/:username/friends/:friendUsername', async (req, res) => {
    try {
        const { username, friendUsername } = req.params;
        const user = await User.findOne({ username });
        const friend = await User.findOne({ username: friendUsername });
        if (!user || !friend) {
            return res.status(404).json({ error: 'User or friend not found' });
        }
        // Remove friend from user's friend list
        user.friends = user.friends.filter(id => !id.equals(friend._id));
        await user.save();
        return res.status(200).json(user);
    }
    catch (err) {
        console.log('Uh Oh, something went wrong', err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});
// Find the user and update the fields based on provided data
app.put('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const updateData = req.body;
        const updatedUser = await User.findOneAndUpdate({ username }, updateData, { new: true, runValidators: true } // Return the updated document and validate data
        );
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(updatedUser);
    }
    catch (err) {
        console.log('Uh Oh, something went wrong', err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});
//Find user by ID
app.get('/user/id/:_id', async (req, res) => {
    try {
        const { _id } = req.params;
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
    }
    catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});
db.once('open', () => {
    app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}!`);
    });
});
