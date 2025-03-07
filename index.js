const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.static('public'));
app.use(express.json());

// 投票頁面路由
app.get('/booth/:id', (req, res) => {
  res.sendFile(__dirname + '/public/booth.html');
});

// 投票處理
app.post('/vote', async (req, res) => {
  const { boothId } = req.body;
  try {
    await pool.query('UPDATE booths SET votes = votes + 1 WHERE booth_id = $1', [boothId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// 初始化資料庫
async function initDB() {
  try {
    const check = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'booths')");
    if (!check.rows[0].exists) {
      await pool.query('CREATE TABLE booths (booth_id INTEGER PRIMARY KEY, votes INTEGER DEFAULT 0)');
      const values = Array.from({length: 200}, (_, i) => `(${i+1}, 0)`).join(',');
      await pool.query(`INSERT INTO booths (booth_id, votes) VALUES ${values}`);
      console.log('Database initialized');
    }
  } catch (error) {
    console.error('Init error:', error);
  }
}
// 新增獲取票數的路由
app.get('/votes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT votes FROM booths WHERE booth_id = $1', [id]);
        if (result.rows.length > 0) {
            res.json({ votes: result.rows[0].votes });
        } else {
            res.status(404).json({ error: 'Booth not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// 獲取所有攤位的票數
app.get('/votes', async (req, res) => {
    try {
        const result = await pool.query('SELECT booth_id, votes FROM booths ORDER BY booth_id');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

initDB();

app.listen(port, () => console.log(`Server running on port ${port}`));