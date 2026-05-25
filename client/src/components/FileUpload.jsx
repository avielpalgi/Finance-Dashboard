import React, { useState } from 'react';
import '../styles/main.module.scss';

const FileUpload = () => {
    const [preview, setPreview] = useState([]);

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    if (data.success) {
        setPreview(data.parsedData || []); // הוספנו || [] כדי למנוע קריסה
        alert('הקובץ הועלה בהצלחה!');
    }
};

    return (
        <div className="upload-container">
            <input type="file" onChange={handleFileUpload} />
            <table>
                {preview.map(item => (
                    <tr key={item.transactionId}>
                        <td>{item.date}</td>
                        <td>{item.description}</td>
                        <td>{item.amount}</td>
                    </tr>
                ))}
            </table>
        </div>
    );
};

export default FileUpload;