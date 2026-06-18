import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

const invalidJSON = (req, res) => {
    const { firstName, lastName } = req.body || {};
    if (!firstName || !lastName) {
        res.status(400).json({ error: 'Invalid JSON' });
        return true;
    }
    return false;
};

app.get('/hello', (req, res) => {
    const name = req.query.name || 'Guest';
    return res.json({ message: `Hello, ${name}!` });
});
app.post('/hello', (req, res) => {
    if (invalidJSON(req, res)) return;
    const { firstName, lastName } = req.body;
    return res.json({ message: `Hello, ${firstName} ${lastName}!` });
});
app.post('/feed', (req, res) => {
    if (invalidJSON(req, res)) return;
    const { firstName, lastName } = req.body;
    const personFeed = { 
        fullName: `${firstName} ${lastName}`,
        foods: ['Candy', 'Pizza', 'Sushi'] 
    };
    res.json(personFeed);
});

app.use((req, res) => {
    res.status(404).type('text/plain; charset=utf-8').send('Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});