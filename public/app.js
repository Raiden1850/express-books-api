
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

const addButton = bookForm.querySelector('button[type="submit"]');
const saveButton = editForm.querySelector('button[type="submit"]');

function showError(message) {
    errorMessage.textContent = message;
}

function clearError() {
    errorMessage.textContent = '';
}

// Read the API's specific error message when available.
async function getErrorMessage(response, fallback) {
    try {
        const data = await response.json();

        if (Array.isArray(data.details) && data.details.length) {
            return data.details.join(' ');
        }

        if (data.error) {
            return data.error;
        }
    } catch {
        // Response wasn't JSON.
    }

    return fallback;
}

// READ - Load all books
async function loadBooks() {
    loading.textContent = 'Loading books...';
    loading.style.display = 'block';
    clearError();

    try {
        const response = await fetch('/books');

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(response, 'Failed to load books.')
            );
        }

        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        showError(`Could not load books: ${error.message}`);
    } finally {
        loading.style.display = 'none';
    }
}

// Display books safely, without inserting book data as HTML.
function displayBooks(books) {
    bookList.replaceChildren();

    if (books.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'No books found. Add a book to get started.';
        bookList.appendChild(message);
        return;
    }

    books.forEach(book => {
        const element = document.createElement('div');
        element.className = 'book';

        const title = document.createElement('h3');
        title.textContent = book.title;

        const author = document.createElement('p');
        author.textContent = `Author: ${book.author}`;

        const year = document.createElement('p');
        year.textContent = `Year: ${book.year}`;

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'edit-button';
        editButton.dataset.id = book._id;
        editButton.textContent = 'Edit';

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-button';
        deleteButton.dataset.id = book._id;
        deleteButton.textContent = 'Delete';

        element.append(title, author, year, editButton, deleteButton);
        bookList.appendChild(element);
    });
}

// CREATE - Add a book
bookForm.addEventListener('submit', async event => {
    event.preventDefault();
    clearError();

    addButton.disabled = true;
    addButton.textContent = 'Adding...';

    try {
        const response = await fetch('/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                year: document.getElementById('year').value
            })
        });

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(response, 'Failed to create book.')
            );
        }

        bookForm.reset();
        await loadBooks();
    } catch (error) {
        showError(`Could not add book: ${error.message}`);
    } finally {
        addButton.disabled = false;
        addButton.textContent = 'Add Book';
    }
});

// Open edit form
function openEditForm(book) {
    editId.value = book._id;
    editTitle.value = book.title;
    editAuthor.value = book.author;
    editYear.value = book.year;

    editSection.hidden = false;
    editSection.scrollIntoView({ behavior: 'smooth' });
}

// UPDATE - Save changes
editForm.addEventListener('submit', async event => {
    event.preventDefault();
    clearError();

    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    try {
        const response = await fetch(`/books/${editId.value}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: editTitle.value,
                author: editAuthor.value,
                year: editYear.value
            })
        });

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(response, 'Failed to update book.')
            );
        }

        editForm.reset();
        editSection.hidden = true;
        await loadBooks();
    } catch (error) {
        showError(`Could not update book: ${error.message}`);
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Changes';
    }
});

// Cancel edit
cancelEdit.addEventListener('click', () => {
    editForm.reset();
    editSection.hidden = true;
    clearError();
});

// DELETE - Remove a book
async function deleteBook(id, button) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    clearError();
    button.disabled = true;
    button.textContent = 'Deleting...';

    try {
        const response = await fetch(`/books/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(response, 'Failed to delete book.')
            );
        }

        await loadBooks();
    } catch (error) {
        showError(`Could not delete book: ${error.message}`);
        button.disabled = false;
        button.textContent = 'Delete';
    }
}

// Handle Edit and Delete buttons
bookList.addEventListener('click', async event => {
    const button = event.target.closest('button');

    if (!button || !bookList.contains(button)) return;

    const id = button.dataset.id;

    if (button.classList.contains('edit-button')) {
        clearError();
        button.disabled = true;
        button.textContent = 'Loading...';

        try {
            const response = await fetch(`/books/${id}`);

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(response, 'Failed to load book.')
                );
            }

            const book = await response.json();
            openEditForm(book);
        } catch (error) {
            showError(`Could not open book: ${error.message}`);
        } finally {
            button.disabled = false;
            button.textContent = 'Edit';
        }
    }

    if (button.classList.contains('delete-button')) {
        await deleteBook(id, button);
    }
});

// Load books when page opens
loadBooks();
