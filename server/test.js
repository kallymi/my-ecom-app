const express = require('express');
const app = express();

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test OK' });
});

app.listen(5000, () => console.log('Test server on port 5000'));