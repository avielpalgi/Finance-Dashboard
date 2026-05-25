const pdfParse = require('pdf-parse');

const parsePdf = async (buffer) => {
    const data = await pdfParse(buffer);
    
    // 1. פיצול לשורות וניקוי ראשוני
    return data.text.split('\n')
        .map(line => line.trim())
        // 2. סינון קשיח: חייב תאריך, אסור מילים של כותרות/סיכומים
        .filter(line => {
            const hasDate = /\d{2}\/\d{2}\/\d{2}/.test(line);
            const isGarbage = line.includes('תאריך הדפסה') || 
                             line.includes('סה"כ') || 
                             line.includes('יתרת סגירה') ||
                             line.length < 15;
            return hasDate && !isGarbage;
        })
        .map(line => {
            // חילוץ תאריך
            const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{2})/);
            const date = dateMatch ? dateMatch[1] : '01/01/26';
            
            // חילוץ סכום (מתקן בעיות של ספרות שנדבקות)
            const amountMatch = line.match(/([\d,]+\.\d{2})/);
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;
            
            // חילוץ תיאור: מנקים את התאריך והסכום מהשורה
            let description = line.replace(date, '').replace(amountMatch ? amountMatch[1] : '', '').trim();
            // מסירים תווים לא רלוונטיים שנדבקו לתיאור
            description = description.replace(/^\d+/, '').trim(); 

            // יצירת מזהה ייחודי קבוע (כדי למנוע כפילויות בשמירה)
            const transactionId = Buffer.from(`${date}-${amount}-${description}`).toString('base64').substring(0, 16);

            return {
                transactionId,
                date,
                description: description || 'תנועה לא מזוהה',
                amount: Math.abs(amount),
                type: (line.includes('הכנסה') || amount < 0) ? 'income' : 'expense',
                monthKey: date.split('/')[1] + '-' + date.split('/')[2]
            };
        });
};

// פונקציית Merge חכמה למניעת כפילויות
const parseAndMerge = (newData, existingData = []) => {
    // הופכים את הקיים ל-Map כדי לדרוס כפילויות בקלות
    const map = new Map(existingData.map(item => [item.transactionId, item]));
    
    // מוסיפים רק מה שלא קיים
    newData.forEach(item => {
        if (!map.has(item.transactionId)) {
            map.set(item.transactionId, item);
        }
    });
    
    return Array.from(map.values());
};

module.exports = { parsePdf, parseAndMerge };