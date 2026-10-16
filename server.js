const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/Book');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Validate request data before saving
function validateBook(data) {
    const errors = [];

    if (typeof data.title !== 'string' || !data.title.trim()) {
        errors.push('A non-empty book title is required.');
    } else if (data.title.trim().length > 200) {
        errors.push('Book title cannot exceed 200 characters.');
    }

    if (typeof data.author !== 'string' || !data.author.trim()) {
        errors.push('A non-empty author name is required.');
    } else if (data.author.trim().length > 120) {
        errors.push('Author name cannot exceed 120 characters.');
    }

    const year = data.year;
    const currentYear = new Date().getFullYear();

    if (
        year === undefined ||
        year === null ||
        year === '' ||
        !Number.isInteger(Number(year)) ||
        Number(year) < 1 ||
        Number(year) > currentYear + 5
    ) {
        errors.push(`Publication year must be a whole number between 1 and ${currentYear + 5}.`);
    }

    return errors;
}

// Check MongoDB ID format
function validId(id) {
    return mongoose.isValidObjectId(id);
}

// Return useful validation errors
function handleError(res, error, fallback) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({
            error: error.message
        });
    }

    console.error(fallback, error);
    return res.status(500).json({
        error: fallback
    });
}

// GET all books
app.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        handleError(res, error, 'Failed to retrieve books.');
    }
});

// GET one book
app.get('/books/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid book ID.' });
    }

    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        res.json(book);
    } catch (error) {
        handleError(res, error, 'Failed to retrieve book.');
    }
});

// CREATE book
app.post('/books', async (req, res) => {
    const errors = validateBook(req.body);

    if (errors.length) {
        return res.status(400).json({
            error: 'Please correct the book details.',
            details: errors
        });
    }

    try {
        const book = new Book({
            title: req.body.title.trim(),
            author: req.body.author.trim(),
            year: Number(req.body.year)
        });

        const savedBook = await book.save();
        res.status(201).json(savedBook);
    } catch (error) {
        handleError(res, error, 'Failed to create book.');
    }
});

// UPDATE book
app.put('/books/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid book ID.' });
    }

    const errors = validateBook(req.body);

    if (errors.length) {
        return res.status(400).json({
            error: 'Please correct the book details.',
            details: errors
        });
    }

    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title.trim(),
                author: req.body.author.trim(),
                year: Number(req.body.year)
            },
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        res.json(updatedBook);
    } catch (error) {
        handleError(res, error, 'Failed to update book.');
    }
});

// DELETE book
app.delete('/books/:id', async (req, res) => {
    if (!validId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid book ID.' });
    }

    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);

        if (!deletedBook) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        res.json({ message: 'Book deleted successfully.' });
    } catch (error) {
        handleError(res, error, 'Failed to delete book.');
    }
});

// Start only after MongoDB connects
async function startServer() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is missing from the .env file.');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

startServer();