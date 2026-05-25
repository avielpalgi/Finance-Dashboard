import React, { useEffect, useState } from 'react';
import styles from '../styles/main.module.scss';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]); // נתונים קיימים
  const [previewData, setPreviewData] = useState([]);   // נתונים חדשים להצגה

  // טעינה ראשונית
  useEffect(() => { fetch('http://localhost:5000/transactions').then(res => res.json()).then(setTransactions); }, []);

  const handleFileUpload = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    const res = await fetch('http://localhost:5000/upload', { method: 'POST', body: formData });
    const result = await res.json();
    setPreviewData(result.previewData); // הצגה למשתמש לפני שמירה
  };

  const confirmSave = async () => {
    const allData = [...transactions, ...previewData];
    await fetch('http://localhost:5000/save', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ confirmedData: allData }) 
    });
    setTransactions(allData);
    setPreviewData([]); // איפוס תצוגה מקדימה
  };

  const dataToDisplay = previewData.length > 0 ? previewData : transactions;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>ניהול פיננסי {previewData.length > 0 && "(במצב תצוגה מקדימה)"}</h1>
        {previewData.length > 0 ? (
          <button onClick={confirmSave} className={styles.saveBtn}>אשר ושמור למערכת</button>
        ) : (
          <input type="file" onChange={handleFileUpload} />
        )}
      </header>

      <table className={styles.table}>
        <thead><tr><th>תאריך</th><th>תיאור</th><th>סכום</th></tr></thead>
        <tbody>
          {dataToDisplay.map((t, i) => (
            <tr key={i}>
              <td>{t.date}</td>
              <td>{t.description}</td>
              <td className={t.type === 'expense' ? styles.expense : styles.income}>
                {t.type === 'expense' ? `-${t.amount}` : `+${t.amount}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;