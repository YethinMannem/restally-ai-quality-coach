import express from 'express';

const app = express();
app.use(express.json());

app.get('/pets', (_req, res) => {
  res.status(200).json([{ id: '1', name: 'Fido' }]);
});

app.get('/pets/:id', (req, res) => {
  const { id } = req.params;
  if (id === '1') return res.status(200).json({ id: '1', name: 'Fido' });
  return res.status(404).json({ error: 'not found' });
});

// ✅ Make sure THIS exists:
app.post('/pets', (req, res) => {
  const { name } = req.body ?? {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name required' });
  }
  return res.status(201).json({ id: '2', name });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`🐾 sample API running at http://localhost:${port}`);
});
