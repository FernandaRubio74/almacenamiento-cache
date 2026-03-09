const express = require('express');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
    user: 'user',
    host: 'database',
    database: 'servicio1',
    password: 'password',
    port: 5432,
});


app.get('/bd', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tabla2');
    res.json(result.rows);
  } catch (err) {
    console.error('Error en servicio2:', err);
    res.status(500).send('Error en el servicio2');
  }
});

app.listen(4000, () => {
  console.log('service2 escuchando en puerto 4000');
});
