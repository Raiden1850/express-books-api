const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required.'],
        trim: true,
        minlength: [1, 'Book title cannot be empty.'],
        maxlength: [200, 'Book title cannot exceed 200 characters.']
    },
    author: {
        type: String,
        required: [true, 'Author name is required.'],
        trim: true,
        minlength: [1, 'Author name cannot be empty.'],
        maxlength: [120, 'Author name cannot exceed 120 characters.']
    },
    year: {
        type: Number,
        required: [true, 'Publication year is required.'],
        min: [1, 'Publication year must be greater than zero.'],
        max: [new Date().getFullYear() + 5, 'Publication year is too far in the future.'],
        validate: {
            validator: Number.isInteger,
            message: 'Publication year must be a whole number.'
        }
    }
});

module.exports = mongoose.model('Book', bookSchema);