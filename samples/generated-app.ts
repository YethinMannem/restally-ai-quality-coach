import express from 'express';

export const app = express();
app.use(express.json());

// GET /products
app.get('/products', (req, res) => {
  res.status(200).json([
  {
    "id": "1",
    "name": "Example",
    "price": 1
  }
]);
});

// POST /products
app.post('/products', (req, res) => {
  const body = req.body ?? {};
  // Validate required fields
  if (!body.name || typeof body.name !== 'string') {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!body.price || typeof body.price !== 'string') {
    return res.status(400).json({ error: 'price is required' });
  }

  res.status(201).json({
  "id": "1",
  "name": "Example",
  "price": 1
});
});

// GET /products/:productId
app.get('/products/:productId', (req, res) => {
  res.status(200).json({
  "id": "1",
  "name": "Example",
  "price": 1
});
});

// PATCH /products/:productId
app.patch('/products/:productId', (req, res) => {
  const body = req.body ?? {};

  res.status(200).json({
  "id": "1",
  "name": "Example",
  "price": 1
});
});

// DELETE /products/:productId
app.delete('/products/:productId', (req, res) => {
  res.status(204).send();
});

// GET /products/:productId/reviews
app.get('/products/:productId/reviews', (req, res) => {
  res.status(200).json([
  {
    "id": "1",
    "rating": 1,
    "comment": "example"
  }
]);
});
