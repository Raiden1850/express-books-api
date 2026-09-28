const express = require('express');
const app = express();

app.use(express.json());

let books = [];

// GET all books
app.get('/books', (req, res) => {
    res.json(books);
});

// GET one book by ID
app.get('/books/:id', (req, res) => {
    const book = books.find(book => book.id === parseInt(req.params.id));

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
});

// POST a new book
app.post('/books', (req, res) => {
    const book = req.body;

    book.id = books.length + 1;

    books.push(book);

    res.status(201).json(book);
});

// PUT/update a book
app.put('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Book not found" });
    }

    const updatedBook = {
        ...books[index],
        ...req.body
    };

    books[index] = updatedBook;

    res.json(updatedBook);
});

app.delete('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Book not found" });
    }

    books.splice(index, 1);

    res.status(204).send();
});

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});