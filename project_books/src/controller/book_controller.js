import {
    createBook,
    deleteAuthorByName,
    deleteBookByIsbn,
    getAuthorsByBook,
    getBookByIsbn,
    getBooksByAuthor,
    getBooksByPublisher,
    getPublishersByAuthor,
    patchBookTitle,
} from '../service/book_service.js';

export const addBook = (req, res) => {
    const created = createBook(req.body);
    return res.status(200).json(created);
};

export const findBookByIsbn = (req, res) => {
    return res.status(200).json(getBookByIsbn(req.params.isbn));
};

export const removeBook = (req, res) => {
    return res.status(200).json(deleteBookByIsbn(req.params.isbn));
};

export const updateBookTitle = (req, res) => {
    return res.status(200).json(patchBookTitle(req.params.isbn, req.params.title));
};

export const findBooksByAuthor = (req, res) => {
    return res.status(200).json(getBooksByAuthor(req.params.author));
};

export const findBooksByPublisher = (req, res) => {
    return res.status(200).json(getBooksByPublisher(req.params.publisher));
};

export const findBookAuthors = (req, res) => {
    return res.status(200).json(getAuthorsByBook(req.params.isbn));
};

export const findPublishersByAuthor = (req, res) => {
    return res.status(200).json(getPublishersByAuthor(req.params.author));
};

export const removeAuthor = (req, res) => {
    return res.status(200).json(deleteAuthorByName(req.params.author));
};