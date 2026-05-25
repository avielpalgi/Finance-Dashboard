import React, { useState } from 'react';

const CategoryManager = ({ onCategoryAdded }) => {
    const [name, setName] = useState('');

    const addCategory = async () => {
        await fetch('http://localhost:5000/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, mainCategory: 'כללי', type: 'expense' })
        });
        onCategoryAdded(); // רענון הנתונים בטבלה
        setName('');
    };

    return (
        <div style={{ margin: '20px 0' }}>
            <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="שם קטגוריה חדשה (למשל: תקשורת)" 
            />
            <button onClick={addCategory}>הוסף קטגוריה</button>
        </div>
    );
};
export default CategoryManager;