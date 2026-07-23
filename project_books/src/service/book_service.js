import {
    addBook,
    findAuthorsByBookIsbn,
    findBookByIsbn,
    findBooksByAuthorName,
    findBooksByPublisherName,
    findPublishersByAuthorName,
    removeAuthorByName,
    removeBookByIsbn,
    updateBookTitleByIsbn,
} from '../repo/book_repo.js';
import { badRequest, conflict, notFound } from '../model/api_error.js';
import { normalizeBookInput, normalizeQueryParam, validateBookInput } from '../model/book_model.js';

export const createBook = (book) => {
    const normalizedBook = normalizeBookInput(book);
    if (!validateBookInput(normalizedBook)) {
        throw badRequest('Book payload is invalid');
    }

    const created = addBook(normalizedBook);
    if (!created) {
        throw conflict(`Book with isbn ${normalizedBook.isbn} already exists`);
    }

    return true;
};

export const getBookByIsbn = (isbn) => {
    const normalizedIsbn = normalizeQueryParam(isbn);
    if (!normalizedIsbn) {
        throw badRequest('isbn is required');
    }

    const book = findBookByIsbn(normalizedIsbn);
    if (!book) {
        throw notFound(`Book with isbn ${normalizedIsbn} not found`);
    }

    return book;
};

export const deleteBookByIsbn = (isbn) => {
    const normalizedIsbn = normalizeQueryParam(isbn);
    if (!normalizedIsbn) {
        throw badRequest('isbn is required');
    }

    const removed = removeBookByIsbn(normalizedIsbn);
    if (!removed) {
        throw notFound(`Book with isbn ${normalizedIsbn} not found`);
    }

    return removed;
};

export const patchBookTitle = (isbn, title) => {
    const normalizedIsbn = normalizeQueryParam(isbn);
    const normalizedTitle = normalizeQueryParam(title);

    if (!normalizedIsbn) {
        throw badRequest('isbn is required');
    }

    if (!normalizedTitle) {
        throw badRequest('title is required');
    }

    const updated = updateBookTitleByIsbn(normalizedIsbn, normalizedTitle);
    if (!updated) {
        throw notFound(`Book with isbn ${normalizedIsbn} not found`);
    }

    return updated;
};

export const getBooksByAuthor = (authorName) => {
    const normalizedAuthor = normalizeQueryParam(authorName);
    if (!normalizedAuthor) {
        throw badRequest('author is required');
    }

    return findBooksByAuthorName(normalizedAuthor);
};

export const getBooksByPublisher = (publisher) => {
    const normalizedPublisher = normalizeQueryParam(publisher);
    if (!normalizedPublisher) {
        throw badRequest('publisher is required');
    }

    return findBooksByPublisherName(normalizedPublisher);
};

export const getAuthorsByBook = (isbn) => {
    const normalizedIsbn = normalizeQueryParam(isbn);
    if (!normalizedIsbn) {
        throw badRequest('isbn is required');
    }

    const authors = findAuthorsByBookIsbn(normalizedIsbn);
    if (!authors) {
        throw notFound(`Book with isbn ${normalizedIsbn} not found`);
    }

    return authors;
};

export const getPublishersByAuthor = (authorName) => {
    const normalizedAuthor = normalizeQueryParam(authorName);
    if (!normalizedAuthor) {
        throw badRequest('author is required');
    }

    return findPublishersByAuthorName(normalizedAuthor);
};

export const deleteAuthorByName = (authorName) => {
    const normalizedAuthor = normalizeQueryParam(authorName);
    if (!normalizedAuthor) {
        throw badRequest('author is required');
    }

    const removed = removeAuthorByName(normalizedAuthor);
    if (!removed) {
        throw notFound(`Author ${normalizedAuthor} not found`);
    }

    return removed;
};