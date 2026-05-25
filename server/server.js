const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { parseHtml, parsePdf, parseAndMerge } = require('./parsers');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// הוסף את ה-Endpoints האלו בבירור:
app.get('/transactions', (req, res) => {
    const dbPath = path.join(__dirname, 'data', 'transactions.json');
    res.json(JSON.parse(fs.readFileSync(dbPath, 'utf8')));
});

app.get('/categories', (req, res) => {
    const dbPath = path.join(__dirname, 'data', 'categories.json');
    res.json(JSON.parse(fs.readFileSync(dbPath, 'utf8')));
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const newData = await parsePdf(req.file.buffer);
        // מחזירים את הנתונים לדפדפן כדי שתוכל לראות אותם
        res.json({ status: 'preview', data: newData }); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// נוסיף endpoint חדש לשמירה סופית
app.post('/save', express.json(), (req, res) => {
    const { confirmedData } = req.body;
    // כאן נכתוב את הלוגיקה שדורסת או מעדכנת נכון
    fs.writeFileSync(dbPath, JSON.stringify(confirmedData, null, 2));
    res.json({ success: true });
});

app.listen(5000, () => console.log("Server running on port 5000"));