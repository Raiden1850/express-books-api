const bookForm = document.getElementById('bookForm');
const editForm = document.getElementById('editForm');
const bookList = document.getElementById('bookList');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error');

const editSection = document.getElementById('editSection');
const editId = document.getElementById('editId');
const editTitle = document.getElementById('editTitle');
const editAuthor = document.getElementById('editAuthor');
const editYear = document.getElementById('editYear');
const cancelEdit = document.getElementById('cancelEdit');


// READ - Load all books
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

            <button class="edit-button" data-id="${book._id}">
                Edit
            </button>

            <button class="delete-button" data-id="${book._id}">
                Delete
            </button>
        `;

        bookList.appendChild(bookElement);
    });
}


// CREATE - Add a book
bookForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    errorMessage.textContent = '';

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


// Open edit form
function openEditForm(book) {
    editId.value = book._id;
    editTitle.value = book.title;
    editAuthor.value = book.author;
    editYear.value = book.year;

    editSection.hidden = false;

    editSection.scrollIntoView({
        behavior: 'smooth'
    });
}


// UPDATE - Save changes
editForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    errorMessage.textContent = '';

    const id = editId.value;

    try {
        const response = await fetch(`/books/${id}`, {
            method: 'PUT',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                title: editTitle.value,
                author: editAuthor.value,
                year: Number(editYear.value)
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update book');
        }

        editForm.reset();

        editSection.hidden = true;

        await loadBooks();

    } catch (error) {
        errorMessage.textContent = error.message;
    }
});


// Cancel edit
cancelEdit.addEventListener('click', () => {
    editForm.reset();
    editSection.hidden = true;
});


// DELETE - Remove a book
async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    errorMessage.textContent = '';

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


// Handle Edit and Delete buttons
bookList.addEventListener('click', async (event) => {

    if (event.target.classList.contains('edit-button')) {
        const id = event.target.dataset.id;

        try {
            const response = await fetch(`/books/${id}`);

            if (!response.ok) {
                throw new Error('Failed to load book');
            }

            const book = await response.json();

            openEditForm(book);

        } catch (error) {
            errorMessage.textContent = error.message;
        }
    }


    if (event.target.classList.contains('delete-button')) {
        const id = event.target.dataset.id;

        await deleteBook(id);
    }
});


// Load books when page opens
loadBooks();