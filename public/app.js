const bookForm = document.getElementById('bookForm');
const bookList = document.getElementById('bookList');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error');

// Load all books
async function loadBooks() {
    loading.style.display = 'block';
    errorMessage.textContent = '';

    try {
        const response = await fetch('/books');

        if (!response.ok) {
            throw new Error('Failed to load books');
        }

        const books = await response.json();

        displayBooks(books);
    } catch (error) {
        errorMessage.textContent = error.message;
    } finally {
        loading.style.display = 'none';
    }
}

// Display books
function displayBooks(books) {
    bookList.innerHTML = '';

    if (books.length === 0) {
        bookList.innerHTML = '<p>No books found.</p>';
        return;
    }

    books.forEach(book => {
        const bookElement = document.createElement('div');

        bookElement.className = 'book';

        bookElement.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Year: ${book.year}</p>

            <button onclick="editBook('${book._id}', '${book.title}', '${book.author}', ${book.year})">
                Edit
            </button>

            <button onclick="deleteBook('${book._id}')">
                Delete
            </button>
        `;

        bookList.appendChild(bookElement);
    });
}

// Create a book
bookForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;

    try {
        const response = await fetch('/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                author,
                year: Number(year)
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create book');
        }

        bookForm.reset();

        await loadBooks();

    } catch (error) {
        errorMessage.textContent = error.message;
    }
});

// Update a book
async function editBook(id, oldTitle, oldAuthor, oldYear) {
    const title = prompt('Enter the new title:', oldTitle);

    if (title === null) {
        return;
    }

    const author = prompt('Enter the new author:', oldAuthor);

    if (author === null) {
        return;
    }

    const year = prompt('Enter the new year:', oldYear);

    if (year === null) {
        return;
    }

    try {
        const response = await fetch(`/books/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                author,
                year: Number(year)
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update book');
        }

        await loadBooks();

    } catch (error) {
        errorMessage.textContent = error.message;
    }
}

// Delete a book
async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    try {
        const response = await fetch(`/books/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete book');
        }

        await loadBooks();

    } catch (error) {
        errorMessage.textContent = error.message;
    }
}

// Load books when the page opens
loadBooks();