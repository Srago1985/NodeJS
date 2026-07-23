const booksByIsbn = new Map();

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalize = (value) => String(value || '').trim();

export const addBook = (book) => {
    const isbn = normalize(book?.isbn);
    if (!isbn || booksByIsbn.has(isbn)) {
        return false;
    }

    booksByIsbn.set(isbn, clone(book));
    return true;
};

export const findBookByIsbn = (isbn) => {
    const found = booksByIsbn.get(normalize(isbn));
    return found ? clone(found) : null;
};

export const removeBookByIsbn = (isbn) => {
    const key = normalize(isbn);
    const found = booksByIsbn.get(key);
    if (!found) {
        return null;
    }

    booksByIsbn.delete(key);
    return clone(found);
};

export const updateBookTitleByIsbn = (isbn, title) => {
    const key = normalize(isbn);
    const found = booksByIsbn.get(key);
    if (!found) {
        return null;
    }

    const updated = {
        ...found,
        title: normalize(title),
    };

    booksByIsbn.set(key, updated);
    return clone(updated);
};

export const findBooksByAuthorName = (authorName) => {
    const target = normalize(authorName);
    return [...booksByIsbn.values()]
        .filter((book) => (book.authors || []).some((author) => normalize(author.name) === target))
        .map(clone);
};

export const findBooksByPublisherName = (publisher) => {
    const target = normalize(publisher);
    return [...booksByIsbn.values()]
        .filter((book) => normalize(book.publisher) === target)
        .map(clone);
};

export const findAuthorsByBookIsbn = (isbn) => {
    const found = booksByIsbn.get(normalize(isbn));
    if (!found) {
        return null;
    }

    return clone(found.authors || []);
};

export const findPublishersByAuthorName = (authorName) => {
    const target = normalize(authorName);
    const publishers = new Set();

    for (const book of booksByIsbn.values()) {
        const hasAuthor = (book.authors || []).some((author) => normalize(author.name) === target);
        if (hasAuthor) {
            publishers.add(normalize(book.publisher));
        }
    }

    return [...publishers];
};

export const removeAuthorByName = (authorName) => {
    const target = normalize(authorName);
    let removedAuthor = null;

    for (const [isbn, book] of booksByIsbn.entries()) {
        let removedFromThisBook = false;
        const nextAuthors = [];
        for (const author of book.authors || []) {
            if (normalize(author.name) === target) {
                removedAuthor = removedAuthor || clone(author);
                removedFromThisBook = true;
                continue;
            }

            nextAuthors.push(author);
        }

        if (!removedFromThisBook) {
            continue;
        }

        if (nextAuthors.length === 0) {
            booksByIsbn.delete(isbn);
            continue;
        }

        booksByIsbn.set(isbn, {
            ...book,
            authors: nextAuthors,
        });
    }

    return removedAuthor;
};

export const clearRepo = () => {
    booksByIsbn.clear();
};