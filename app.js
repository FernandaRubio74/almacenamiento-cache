const express = require('express');
const app = express();
const {Pool} = require('pg');
const { createClient } = require('redis');

// está me sirve para lo de la base de datos y que tenga cache dahh
const redisClient = createClient({
    socket: {
        host: 'redis_cache', 
        port: 6379
    }
});

redisClient.connect();

const pool = new Pool({
    user: 'user',
    host: 'database',
    database: 'servicio1',
    password: 'password',
    port: 5432,
});

app.get('/se1', async (req, res) => {
    try {
        // si existe en cache lo extrae de ahí
        const cached = await redisClient.get('tabla1_data');
        if (cached) {
            return res.json({ fuente: 'cache', datos: JSON.parse(cached) });
        }
        
        // si no, consulta desde la bd
        const result = await pool.query('SELECT * FROM tabla1');
        
        // guradado por 30 segundosen cache
        await redisClient.setEx('tabla1_data', 60, JSON.stringify(result.rows));
        
        res.json({ fuente: 'database', datos: result.rows });
    } catch (err) {
        res.status(500).send('Error');
    }
});


app.get('/se2', async (req, res) => {
    try {
        const response = await fetch('http://service2:4000/bd');
        const data = await response.json();
        const html = `
            <h1>TABLA 2 - Respuesta desede el servicio 2, ejemplo de información muy importantes</h1>
            <ul>
                ${data.map(row => `<li>ID: ${row.id} | Name: ${row.name} | Role: ${row.role} | Project: ${row.project}</li>`).join('')}
            </ul>
        `;
        res.send(html);
    } catch (err) {
        console.log('error en conexión', err);
        res.status(500).send('Error en el servicio 2');
    }
});


app.get('/', (req, res) => {
  res.send('Página app principal - aquí no hay nadota, solo la muy páginita sola');
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});