const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// 中介軟體：啟用 JSON 解析
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// 初始化 SQLite 資料庫
const db = new sqlite3.Database('./votes.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('❌ 無法連線到 SQLite 資料庫:', err.message);
    } else {
        console.log('✅ 成功連線到 SQLite 資料庫');

        // 建立 booths 表
        db.run(`
            CREATE TABLE IF NOT EXISTS booths (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                votes INTEGER DEFAULT 0
            )
        `, (err) => {
            if (err) {
                console.error('❌ 建立 booths 表失敗:', err.message);
            } else {
                console.log('✅ booths 表已建立或已存在');
            }
        });
    }
});

// API: 投票
app.post('/api/vote', (req, res) => {
    console.log("Received request:", req.body);  // 確保有收到請求
    const { boothId } = req.body;

    if (!boothId) {
        return res.status(400).json({ error: '缺少 boothId 參數' });
    }

    db.run(`UPDATE booths SET votes = votes + 1 WHERE id = ?`, [boothId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: '投票成功' });
    });
});

// API: 取得所有攤位統計
app.get('/api/results', (req, res) => {
    db.all(`SELECT * FROM booths`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ results: rows });
    });
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`🚀 伺服器運行中：http://localhost:${port}`);
});
