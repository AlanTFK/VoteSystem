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

app.get('/result', (req, res) => {
    res.sendFile(__dirname + '/public/result.html');
});

app.get('/reset', (req, res) => {
  res.sendFile(__dirname + '/public/reset.html');
});

// 投票處理
app.post('/vote', async (req, res) => {
  let boothId = parseInt(req.body.boothId);  // 強制轉為數字
  if (isNaN(boothId)) {
    return res.status(400).json({ success: false, message: '無效的 boothId' });
  }
// ✅ 加入這段：限制時間範圍（台灣時間 UTC+8）
  const now = new Date();
  const taiwanNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));

  const startTime = new Date("2025-05-15T18:15:00+08:00");
  const endTime = new Date("2025-06-02T18:20:00+08:00");

  if (taiwanNow < startTime || taiwanNow > endTime) {
    return res.status(403).json({ success: false, message: '不在投票時間內' });
  }

  try {
    const result = await pool.query('UPDATE booths SET votes = votes + 1 WHERE booth_id = $1', [boothId]);
    if (result.rowCount === 0) {
      console.warn('投票失敗：boothId 不存在或格式錯誤', boothId);
      return res.status(404).json({ success: false, message: '找不到攤位' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('資料庫更新錯誤', error);
    res.status(500).json({ success: false, message: '資料庫錯誤' });
  }
});

// 初始化資料庫
async function initDB() {
  try {
    const check = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'booths')");
    if (!check.rows[0].exists) {
      await pool.query('CREATE TABLE booths (booth_id INTEGER PRIMARY KEY, votes INTEGER DEFAULT 0)');
      // const values = Array.from({length: 200}, (_, i) => `(${i+1}, 0)`).join(',');
      const values = Array.from({length: 166}, (_, i) => `(${i + 40}, 0)`).join(',');
      await pool.query(`INSERT INTO booths (booth_id, votes) VALUES ${values}`);
      console.log('Database initialized');
    }
  } catch (error) {
    console.error('Init error:', error);
  }
}

// 獲取票數最高的前十名攤位
app.get('/votes/top', async (req, res) => {
  try {
      const result = await pool.query(
          'SELECT booth_id, votes FROM booths ORDER BY votes DESC LIMIT 10'
      );
      res.json(result.rows);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
  }
});

app.post('/votes/reset', async (req, res) => {
  try {
    await pool.query('UPDATE booths SET votes = 0');
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.post('/votes/reseed', async (req, res) => {
  try {
    await pool.query('TRUNCATE booths');
    const values = Array.from({ length: 166 }, (_, i) => `(${i + 40}, 0)`).join(',');
    await pool.query(`INSERT INTO booths (booth_id, votes) VALUES ${values}`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// 新增獲取票數的路由
app.get('/votes/:id', async (req, res) => {
    const { id } = req.params;
    // 檢查 id 是否為數字，避免 SQL 錯誤
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid booth ID' });
    }
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


initDB();

app.listen(port, () => console.log(`Server running on port ${port}`));