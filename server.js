/* npm install express 
npm install sqlite3 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

const db = new sqlite3.Database('./rolldice.db');


db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS rolls (id INTEGER PRIMARY KEY AUTOINCREMENT, dice_type INTEGER, result INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
});


app.use(express.json());


app.post('/roll/:sides', (req, res) => {
    const sides = parseInt(req.params.sides);

    if (isNaN(sides) || sides <= 0) {
        return res.status(400).json({ error: 'Número de lados do dado inválido.' });
    }

    const result = simulateRoll(sides);

  
    db.run('INSERT INTO rolls (dice_type, result) VALUES (?, ?)', [sides, result], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao salvar no histórico.' });
        }

        res.json({ result });
    });
});


app.get('/history', (req, res) => {

    db.all('SELECT * FROM rolls ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao recuperar o histórico.' });
        }

        res.json({ history: rows });
    });
});

function simulateRoll(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

app.listen(port, () => {
    console.log(`Servidor escutando na porta ${port}`);
});
