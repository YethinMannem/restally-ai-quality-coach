import express from 'express';

export const app = express();
app.use(express.json());

// GET /pets
app.get('/pets', (req, res) => {
  res.status(200).json([
  {
    "id": "1",
    "name": "Example"
  }
]);
});

// POST /pets
app.post('/pets', (req, res) => {
  const body = req.body ?? {};

  res.status(201).json({
  "id": "1",
  "name": "Example"
});
});

// GET /pets/:id
app.get('/pets/:id', (req, res) => {
  res.status(200).json({
  "id": "1",
  "name": "Example"
});
});
