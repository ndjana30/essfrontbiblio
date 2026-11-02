import React, { useEffect, useState } from 'react';

const TransactionForm = () => {
  const [availableAppareils, setAvailableAppareils] = useState([]);
  const [selectedAppareils, setSelectedAppareils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Helper function to get authorization header
  const getAuthHeader = () => {
    const token = localStorage.getItem('jwt_token');
    console.log("Retrieved Token from localStorage:", token);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 1. Fetch available devices on component mount
  useEffect(() => {
    fetchAvailableAppareils();
  }, []);

  const fetchAvailableAppareils = async () => {

      setLoading(true);
      const res = await fetch('http://localhost:8080/api/v1/appareils/available', {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await res.json();
      console.log("Data received:", data);

      setAvailableAppareils(data || []);

      setLoading(false);
    }


  // 2. Toggle selection of an Appareil
  const handleToggleSelect = (appareil) => {
    const isSelected = selectedAppareils.some((item) => item.id === appareil.id);
    if (isSelected) {
      setSelectedAppareils(selectedAppareils.filter((item) => item.id !== appareil.id));
    } else {
      setSelectedAppareils([...selectedAppareils, appareil]);
    }
  };

  // 3. Submit transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAppareils.length === 0) {
      setMessage({ text: 'Please select at least one appareil.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('http://localhost:8080/api/v1/transaction/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(selectedAppareils),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP error! Status: ${res.status}`);
      }

      const responseText = await res.text();
      const successMessage = responseText ? responseText : 'Transaction started successfully!';

      setMessage({
        text: successMessage,
        type: 'success',
      });
      setSelectedAppareils([]);
      fetchAvailableAppareils(); // Refresh list after transaction starts
    } catch (err) {
      setMessage({ text: `Failed: ${err.message}`, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Start New Transaction</h2>
        <p style={styles.subtitle}>Select the available devices to include in this transaction.</p>

        {message.text && (
          <div
            style={{
              ...styles.alert,
              backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
              color: message.type === 'error' ? '#991b1b' : '#166534',
              borderColor: message.type === 'error' ? '#fca5a5' : '#86efac',
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.sectionTitle}>
            <span>Available Devices ({selectedAppareils.length} selected)</span>
          </div>

          {loading ? (
            <p style={styles.loadingText}>Loading available appareils...</p>
          ) : availableAppareils.length === 0 ? (
            <p style={styles.emptyText}>No available appareils found.</p>
          ) : (
            <div style={styles.grid}>
              {availableAppareils.map((appareil) => {
                const isSelected = selectedAppareils.some((item) => item.id === appareil.id);

                // Adjust 'appareil.imageUrl' to match your exact backend model field (e.g., appareil.image, appareil.photo, etc.)
                const imageSource = appareil.imageUrl || appareil.image || '';

                return (
                  <div
                    key={appareil.id || appareil.name}
                    onClick={() => handleToggleSelect(appareil)}
                    style={{
                      ...styles.itemCard,
                      borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by parent container click
                      style={styles.checkbox}
                    />

                    {/* Appareil Image */}
                   {imageSource ? (
                     <img
                       src={`data:image/jpeg;base64,${imageSource}`}
                       alt={appareil.name || 'Appareil'}
                       style={styles.appareilImage}
                     />
                   ) : (
                     <div style={styles.noImagePlaceholder}>No Image</div>
                   )}

                    <div style={styles.itemInfo}>
                      <span style={styles.itemName}>{appareil.name || 'Unnamed Appareil'}</span>
                      {appareil.number && (
                        <span style={styles.itemNumber}>Appareil Number: {appareil.number}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || selectedAppareils.length === 0}
            style={{
              ...styles.button,
              opacity: submitting || selectedAppareils.length === 0 ? 0.6 : 1,
              cursor: submitting || selectedAppareils.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Processing Transaction...' : 'Start Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Inline CSS Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '650px',
    padding: '32px',
  },
  title: {
    margin: '0 0 8px 0',
    color: '#111827',
    fontSize: '24px',
    fontWeight: '700',
  },
  subtitle: {
    margin: '0 0 24px 0',
    color: '#6b7280',
    fontSize: '14px',
  },
  alert: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '20px',
    fontSize: '14px',
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '12px',
    maxHeight: '350px',
    overflowY: 'auto',
    paddingRight: '4px',
    marginBottom: '24px',
  },
  itemCard: {
    border: '2px solid',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#3b82f6',
  },
  appareilImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  noImagePlaceholder: {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    fontSize: '10px',
    textAlign: 'center',
    borderRadius: '6px',
    border: '1px dashed #d1d5db',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  itemName: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemNumber: {
    fontSize: '11px',
    color: '#6b7280',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '20px 0',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '20px 0',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  },
};

export default TransactionForm;