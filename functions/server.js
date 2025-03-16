import express from 'express';
import cors from "cors";
import serverless from 'serverless-http';
import { MongoClient, ObjectId } from 'mongodb';
import { User } from './models/user.js';
import { Role } from './models/role.js';
import { Category } from './models/category.js';
import { ArtWork } from './models/artWork.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
// const secret = crypto.randomBytes(32).toString('hex');
// console.log(secret);
var app = express();

app.use(cors());

app.use(express.json());

var port = process.env.PORT || 3000;

const router = express.Router();

const uri = process.env.MONGODB_URI ?? 'mongodb+srv://carlosgorostizu:ti6qomcrjkLq3u4Y@database-pdd.ytz6f.mongodb.net/';

const jwts = process.env.JWT_SECRET ?? '09780341b01585892e24dd91ead22ba9287291ae1ed85cfaef546ab4aaec1c70';

let client = new MongoClient(uri);

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authorization header missing or malformed:' + authHeader });
    }

    jwt.verify(token, jwts, (err, user) => {
        if (err) {
            console.error('Token verification error:', err.message);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        console.log('Authenticated user:', user);
        req.user = user;
        next();
    });
};


router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (typeof jwts !== 'string' || jwts.trim() === '') {
            throw new Error('JWT_SECRET is invalid or undefined');
        }

        const database = client.db('database-pdd');

        const userCollection = database.collection('users');

        const user = await userCollection.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            jwts,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            data: {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                    age: user.age,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred during login: ' + error.message + jwts });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { name, lastName, email, age, password } = req.body;

        if (!name || !lastName || !email || !age || !password) {
            return res.status(400).json({ message: 'Name, lastName, email, password, and age are required' });
        }

        const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/;

        if (!nameRegex.test(name)) {
            return res.status(400).json({ message: 'Invalid name format' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (age < 1 || age > 120) {
            return res.status(400).json({ message: 'Age must be between 1 and 120' });
        }

        const database = client.db('database-pdd');

        const userCollection = database.collection('users');

        const existingUser = await userCollection.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: 'User already registered' });
        }

        const newUser = new User({
            name,
            lastName,
            email,
            age,
            role: Role.GUEST,
            password: await bcrypt.hash(password, 10),
        });

        const result = await userCollection.insertOne(newUser);

        newUser._id = result.insertedId;

        return res.status(201).json({
            message: 'User registered successfully',
            data: newUser,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/users', authenticateToken, async (req, res) => {
    try {
        const database = client.db('database-pdd');

        const userCollection = database.collection('users');

        const result = await userCollection.find({}).toArray();

        if (result.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        return res.status(200).json({
            message: 'Users retrieved successfully',
            data: result,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/users:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const database = client.db('database-pdd');

        const userCollection = database.collection('users');

        const result = await userCollection.findOne({
            _id: new ObjectId(userId),
        }).toArray();

        if (result.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        return res.status(200).json({
            message: 'Users retrieved successfully',
            data: result,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.put('/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { name, lastName, email, age } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        if (!name && !lastName && !email) {
            return res.status(400).json({ message: 'At least one field is required to update' });
        }

        if (age < 1 || age > 120) {
            return res.status(400).json({ message: 'Age must be between 1 and 120' });
        }

        const database = client.db('database-pdd');

        const users = database.collection('users');

        const updateFields = {};
        if (name) updateFields.name = name;
        if (lastName) updateFields.lastName = lastName;
        if (email) updateFields.email = email;
        if (age) updateFields.age = age;

        const result = await users.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'User not found or no changes were made' });
        }

        return res.status(200).json({ message: 'User updated successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating the user' + error.message });
    }
});
router.delete('/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const database = client.db('database-pdd');

        const users = database.collection('users');

        const result = await users.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while deleting the user' + error.message });
    }
});
router.delete('/users', authenticateToken, async (req, res) => {
    try {
        const database = client.db('database-pdd');

        const users = database.collection('users');

        const result = await users.deleteMany({});

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No users found to delete' });
        }

        return res.status(200).json({ message: 'Users deleted successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while deleting the users' + error.message });
    }
});

router.put('/users/:userId/makeAdmin', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const database = client.db('database-pdd');

        const users = database.collection('users');

        const user = await users.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === Role.ADMIN) {
            return res.status(400).json({ message: 'User is already an admin' });
        }
        const result = await users.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { role: Role.ADMIN } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({ message: 'Failed to update user role' });
        }

        return res.status(200).json({ message: 'User role updated to admin successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating the user role' + error.message });
    }
});

router.put('/users/:userId/makeGuest', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const database = client.db('database-pdd');

        const users = database.collection('users');

        const user = await users.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === Role.GUEST) {
            return res.status(400).json({ message: 'User is already a guest' });
        }

        const result = await users.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { role: Role.GUEST } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({ message: 'Failed to update user role' });
        }

        return res.status(200).json({ message: 'User role updated to guest successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while updating the user role' + error.message });
    }
});

router.post('/categories', authenticateToken, async (req, res) => {
    try {
        const { title, description, image } = req.body;

        if (!title || !description || !image) {
            return res.status(400).json({ message: 'Title, description, and image are required' });
        }

        const database = client.db('database-pdd');

        const categoryCount = await database.collection('categories').countDocuments();

        if (categoryCount >= 6) {
            return res.status(400).json({ message: 'Max 6 categories allowed' });
        }

        const newCategory = new Category({ _id: new ObjectId(), title, description, image, artworks: [] });

        await database.collection('categories').insertOne(newCategory);

        res.status(201).json({
            message: "Category created successfully",
            data: newCategory,
        });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while creating the category: ' + error.message });
    }
});

router.get('/categories/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;

        const database = client.db('database-pdd');

        if (!ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: 'Invalid category ID format' });
        }

        const category = await database.collection('categories').findOne({ _id: new ObjectId(categoryId) });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Category retrieved successfully",
            data: category,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const database = client.db('database-pdd');

        const categories = await database.collection('categories').find().toArray();

        res.status(200).json({
            message: "Categories retrieved successfully",
            data: categories,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/categories/:categoryId', authenticateToken, async (req, res) => {
    try {
        const { categoryId } = req.params;

        const { title, description, image } = req.body;

        const database = client.db('database-pdd');

        if (!title || !description || !image) {
            return res.status(400).json({ message: "Title, description, and images are required" });
        }

        const updateFields = {};
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;
        if (image) updateFields.image = image;

        const result = await database.collection('categories').updateOne(
            { _id: new ObjectId(categoryId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/categories/:categoryId', authenticateToken, async (req, res) => {
    try {
        const { categoryId } = req.params;

        const database = client.db('database-pdd');

        if (!ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: 'Invalid category ID format' });
        }

        const result = await database.collection('categories').deleteOne({ _id: new ObjectId(categoryId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/categories', authenticateToken, async (req, res) => {
    try {
        const database = client.db('database-pdd');

        const result = await database.collection('categories').deleteMany({});

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No categories found to delete" });
        }

        res.status(200).json({ message: "All categories deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/categories/:categoryId/artworks', authenticateToken, async (req, res) => {
    try {
        const { categoryId } = req.params;

        const { title, description, images } = req.body;

        const database = client.db('database-pdd');

        const category = await database.collection('categories').findOne({ _id: new ObjectId(categoryId) });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        if ((category.artworks || []).length >= 4) {
            return res.status(400).json({ message: "Max 4 artworks allowed per category" });
        }

        const artwork = new ArtWork({ _id: new ObjectId(), title, description, images });

        const result = await database.collection('categories').updateOne(
            { _id: new ObjectId(categoryId) },
            { $push: { artworks: artwork } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(201).json({
            message: "Artwork created successfully",
            data: artwork,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/categories/:categoryId/artworks', async (req, res) => {
    try {
        const { categoryId } = req.params;

        const database = client.db('database-pdd');

        if (!ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: 'Invalid category ID format' });
        }
        const category = await database.collection('categories').findOne({ _id: new ObjectId(categoryId) });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Artworks retrieved successfully",
            data: category.artworks,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/categories/:categoryId/artworks/:artworkId', async (req, res) => {
    try {
        const { categoryId, artworkId } = req.params;

        const database = client.db('database-pdd');

        if (!ObjectId.isValid(categoryId) || !ObjectId.isValid(artworkId)) {
            return res.status(400).json({ message: 'Invalid categoryId or artworkId format' });
        }

        const category = await database.collection('categories').findOne({ _id: new ObjectId(categoryId) });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const artwork = category.artworks.find(artwork => artwork._id.toString() === artworkId);

        if (!artwork) {
            return res.status(404).json({ message: "Artwork not found" });
        }

        res.status(200).json({
            message: "Artwork retrieved successfully",
            data: artwork,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/categories/:categoryId/artworks/:artworkId', authenticateToken, async (req, res) => {
    try {
        const { categoryId, artworkId } = req.params;

        const { title, description, images } = req.body;

        const database = client.db('database-pdd');

        if (!title || !description || !images) {
            return res.status(400).json({ message: "Title, description, and images are required" });
        }

        const result = await database.collection('categories').updateOne(
            { _id: new ObjectId(categoryId), 'artworks._id': new ObjectId(artworkId) },
            { $set: { 'artworks.$.title': title, 'artworks.$.description': description, 'artworks.$.images': images } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Artwork not found" });
        }

        res.json({ message: "Artwork updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/categories/:categoryId/artworks/:artworkId', authenticateToken, async (req, res) => {
    try {
        const { categoryId, artworkId } = req.params;

        const database = client.db('database-pdd');

        if (!ObjectId.isValid(categoryId) || !ObjectId.isValid(artworkId)) {
            return res.status(400).json({ error: "Invalid categoryId or artworkId format" });
        }

        const result = await database.collection('categories').updateOne(
            { _id: new ObjectId(categoryId) },
            { $pull: { artworks: { _id: new ObjectId(artworkId) } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Artwork not found" });
        }

        res.status(200).json({ message: "Artwork deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/categories/:categoryId/artworks', authenticateToken, async (req, res) => {
    try {
        const { categoryId } = req.params;

        const database = client.db('database-pdd');

        if (!ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid categoryId format" });
        }

        const result = await database.collection('categories').updateOne(
            { _id: new ObjectId(categoryId) },
            { $set: { artworks: [] } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Artworks not found" });
        }

        res.status(200).json({ message: "Artworks deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.use('/.netlify/functions/server', router);
// app.use(router);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

export const handler = serverless(app);
