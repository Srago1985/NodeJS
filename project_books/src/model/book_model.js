const normalizeString = (value) => String(value || '').trim();

const normalizeAuthor = (author) => ({
    name: normalizeString(author?.name),
    birthDate: normalizeString(author?.birthDate),
});

const hasValidAuthor = (author) => {
    return Boolean(author.name) && Boolean(author.birthDate);
};

export const normalizeBookInput = (book) => ({
    isbn: normalizeString(book?.isbn),
    title: normalizeString(book?.title),
    publisher: normalizeString(book?.publisher),
    authors: Array.isArray(book?.authors) ? book.authors.map(normalizeAuthor) : [],
});

export const validateBookInput = (book) => {
    if (!book.isbn || !book.title || !book.publisher) {
        return false;
    }

    if (!Array.isArray(book.authors) || book.authors.length === 0) {
        return false;
    }

    return book.authors.every(hasValidAuthor);
};

export const normalizeQueryParam = (value) => normalizeString(value);
