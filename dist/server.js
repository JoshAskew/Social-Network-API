import express from 'express';
import db from './config/connection.js';
import { User } from './models/index.js';
import { Types } from 'mongoose';
import Thought from './models/Thought.js';
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
//add thought
app.post('/thought', async (req, res) => {
    try {
        const { thoughtText, username } = req.body;
        if (!thoughtText || thoughtText.length < 1 || thoughtText.length > 280) {
            return res.status(400).json({ error: 'Thought text is required and must be between 1 and 280 characters.' });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const newThought = new Thought({
            thoughtText,
            username,
        });
        // Save the thought to the database
        await newThought.save();
        // Add the thought's ObjectId to the user's thoughts array
        user.thoughts.push(newThought._id); // Type assertion for ObjectId
        await user.save();
        return res.status(201).json(newThought);
    }
    catch (err) {
        console.error('Error adding thought:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});
//Get thought by ID
app.get('/thought/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const thought = await Thought.findById(id);
        // If the thought is not found, return a 404 error
        if (!thought) {
            return res.status(404).json({ error: 'Thought not found' });
        }
        return res.status(200).json(thought);
    }
    catch (err) {
        console.error('Error fetching thought:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});
//Get all thoughts
app.get('/thought', async (_req, res) => {
    try {
        const thoughts = await Thought.find();
        // If no thoughts are found, return an empty array
        if (thoughts.length === 0) {
            return res.status(404).json({ message: 'No thoughts found' });
        }
        // Return the array of thoughts
        return res.status(200).json(thoughts);
    }
    catch (err) {
        console.error('Error fetching thoughts:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});
//Add a reaction to a thought
app.post('/thought/:thoughtId/reaction', async (req, res) => {
    try {
        const { thoughtId } = req.params;
        const { reactionBody, username } = req.body;
        if (!reactionBody || !username) {
            return res.status(400).json({ error: 'Reaction body and username are required' });
        }
        const thought = await Thought.findById(thoughtId);
        if (!thought) {
            return res.status(404).json({ error: 'Thought not found' });
        }
        // Create the reaction object with a unique reactionId
        const newReaction = {
            reactionId: new Types.ObjectId(), // Generates a unique ObjectId for the reaction
            reactionBody,
            username,
            createdAt: new Date(),
        };
        thought.reactions.push(newReaction);
        // Save the updated thought
        await thought.save();
        // Return the updated thought with reactions
        return res.status(200).json(thought);
    }
    catch (err) {
        console.error('Error adding reaction:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});
// Delete a reaction from a thought
app.delete('/thought/:thoughtId/reaction/:reactionId', async (req, res) => {
    try {
        const { thoughtId, reactionId } = req.params;
        // Find the thought by its ID
        const thought = await Thought.findById(thoughtId);
        if (!thought) {
            return res.status(404).json({ error: 'Thought not found' });
        }
        // Find the reaction to be removed
        const reactionIndex = thought.reactions.findIndex((reaction) => reaction.reactionId.toString() === reactionId);
        if (reactionIndex === -1) {
            return res.status(404).json({ error: 'Reaction not found' });
        }
        // Remove the reaction from the thought's reactions array
        thought.reactions.splice(reactionIndex, 1);
        await thought.save();
        return res.status(200).json({ message: 'Reaction deleted' });
    }
    catch (err) {
        console.error('Error deleting reaction:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});
// Get all reactions for a specific thought
app.get('/thought/:thoughtId/reactions', async (req, res) => {
    try {
        const { thoughtId } = req.params;
        // Find the thought by its ID
        const thought = await Thought.findById(thoughtId).select('reactions');
        if (!thought) {
            return res.status(404).json({ error: 'Thought not found' });
        }
        // Return all reactions associated with the thought
        return res.status(200).json(thought.reactions);
    }
    catch (err) {
        console.error('Error fetching reactions:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});
db.once('open', () => {
    app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}!`);
    });
});
