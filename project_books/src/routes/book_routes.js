import { Router } from 'express';
import {
    addBook,
    findBookAuthors,
    findBookByIsbn,
    findBooksByAuthor,
    findBooksByPublisher,
    findPublishersByAuthor,
    removeAuthor,
    removeBook,
    updateBookTitle,
} from '../controller/book_controller.js';

const router = Router();

router.post('/book', addBook);
router.get('/book/:isbn', findBookByIsbn);
router.delete('/book/:isbn', removeBook);
router.patch('/book/:isbn/title/:title', updateBookTitle);

router.get('/books/author/:author', findBooksByAuthor);
router.get('/books/publisher/:publisher', findBooksByPublisher);
router.get('/authors/book/:isbn', findBookAuthors);
router.get('/publishers/author/:author', findPublishersByAuthor);
router.delete('/author/:author', removeAuthor);

export default router;