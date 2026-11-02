import React, { useState } from 'react';

function Appareils() {
  // 1. Form state
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null); // Stores the raw File object
  const [number, setNumber] = useState('');

  // 2. Feedback message state
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 3. Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Save the actual file object
    }
  };

  // 4. Handle form submission using FormData
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh

    // Retrieve JWT from local storage
    const token = localStorage.getItem('jwt_token');

    // Create a FormData object to send multipart/form-data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('number', number);
    if (imageFile) {
      formData.append('image', imageFile); // Appends the file matching @RequestParam("image")
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/appareils/add', {
        method: 'POST',
        headers: {
          // IMPORTANT: Do NOT set 'Content-Type': 'application/json' here.
          // The browser automatically sets it to 'multipart/form-data' with the correct boundary when using FormData.
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setMessage('Appareil added successfully!');
        setIsError(false);
        // Reset form fields
        setName('');
        setImageFile(null);
        setNumber('');
        // Reset the file input element visually if needed
        e.target.reset();
      } else {
        setMessage('Failed to add appareil. Check your token or input.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Network error. Is the backend running?');
      setIsError(true);
    }
  };

  // --- Inline CSS Styles ---
  const styles = {
    container: {
      maxWidth: '400px',
      margin: '50px auto',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      backgroundColor: '#ffffff',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    title: {
      textAlign: 'center',
      marginBottom: '20px',
      color: '#333333'
    },
    formGroup: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '600',
      color: '#555555'
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #cccccc',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    fileInput: {
      width: '100%',
      padding: '8px 0',
      fontSize: '14px'
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#4F46E5',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px'
    },
    message: {
      marginTop: '15px',
      padding: '10px',
      borderRadius: '6px',
      textAlign: 'center',
      fontWeight: 'bold',
      backgroundColor: isError ? '#FEE2E2' : '#D1FAE5',
      color: isError ? '#991B1B' : '#065F46'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Add New Appareil</h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Smart TV"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Image File</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            style={styles.fileInput}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Number</label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g. 101"
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>
          Add Appareil
        </button>
      </form>

      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
}

export default Appareils;