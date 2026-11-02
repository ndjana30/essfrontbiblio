import React, { useState, useEffect } from 'react';

const TRANSACTIONS_API_URL = 'http://localhost:8080/api/v1/transactions/all';

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleToggleStatus = (transactionId) => {
      const token = localStorage.getItem('jwt_token');

      fetch(`http://localhost:8080/api/v1/transaction/end?id=${transactionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.text(); // or res.json() depending on what your service returns
        })
        .then(() => {
          // Update the local state so the UI reflects the change immediately
          setTransactions((prevTransactions) =>
            prevTransactions.map((tx) =>
              tx.id === transactionId
                ? {
                    ...tx,
                    transactionStatus: 'RETURNED',
                    depositTime: new Date().toISOString(),
                  }
                : tx
            )
          );
        })
        .catch((err) => {
          console.error('Failed to end transaction:', err);
        });
    };

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');

    fetch(TRANSACTIONS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setTransactions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getStatusBadgeStyle = (status) => {
    let bg = '#334155';
    let color = '#cbd5e1';
    let border = '#475569';

    if (status === 'COMPLETED') {
      bg = 'rgba(16, 185, 129, 0.1)';
      color = '#34d399';
      border = 'rgba(16, 185, 129, 0.2)';
    } else if (status === 'PENDING') {
      bg = 'rgba(245, 158, 11, 0.1)';
      color = '#fbbf24';
      border = 'rgba(245, 158, 11, 0.2)';
    } else if (status === 'CANCELLED') {
      bg = 'rgba(244, 63, 94, 0.1)';
      color = '#fb7185';
      border = 'rgba(244, 63, 94, 0.2)';
    }

    return {
      backgroundColor: bg,
      color: color,
      border: `1px solid ${border}`,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not deposited yet';
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '16px', color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
          Loading transactions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorBox}>
        <p style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>Failed to load transactions</p>
        <p style={{ fontSize: '13px', marginTop: '4px', color: '#fda4af' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.mainWrapper}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Transactions Management</h1>
            <p style={styles.headerSubtitle}>Real-time overview of equipment assignments and transfers</p>
          </div>
          <div style={styles.totalBadge}>
            Total Transactions: <strong style={{ color: '#ffffff' }}>{transactions.length}</strong>
          </div>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <div style={styles.emptyCard}>No transactions found in the database.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {transactions.map((tx) => (
              <div key={tx.id || Math.random()} style={styles.card}>
                {/* Transaction Card Top Bar */}
                <div style={styles.cardTopBar}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={styles.idBadge}>#{tx.id}</span>
                    <span style={getStatusBadgeStyle(tx.transactionStatus)}>
                      {tx.transactionStatus || 'UNKNOWN'}
                    </span>
                    <button
                                                onClick={() => handleToggleStatus(tx.id, tx.transactionStatus)}
                                                style={styles.actionButton}
                                                onMouseOver={(e) => (e.target.style.backgroundColor = '#4338ca')}
                                                onMouseOut={(e) => (e.target.style.backgroundColor = '#4f46e5')}
                                              >
                                                Change Status
                                              </button>
                  </div>

                  <div style={styles.dateGroup}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block' }}>Collect:</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{formatDate(tx.collectTime)}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block' }}>Deposit:</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{formatDate(tx.depositTime)}</span>
                    </div>
                  </div>
                </div>

                {/* User Info Bar */}
                {tx.user && (
                  <div style={styles.userBar}>
                    <span>
                      <strong style={{ color: '#c7d2fe' }}>Assigned User:</strong>{' '}
                      {tx.user.name || tx.user.username || tx.user.email || `ID: ${tx.user.id}`}
                    </span>
                  </div>
                )}

                {/* Appareils Grid */}
                <div style={styles.cardBody}>
                  <h3 style={styles.sectionTitle}>Appareils List ({tx.appareilsList?.length || 0})</h3>

                  {tx.appareilsList && tx.appareilsList.length > 0 ? (
                    <div style={styles.appareilsGrid}>
                      {tx.appareilsList.map((item, index) => (
                        <div key={item.id || index} style={styles.appareilItem}>
                          {/* Image Box */}
                          <div style={styles.imageContainer}>
                            {item.image ? (
                              <img
                                src={`data:image/jpeg;base64,${item.image}`

                                }
                                alt={item.name || 'Appareil'}
                                style={styles.image}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              style={{
                                ...styles.imageFallback,
                                display: item.image ? 'none' : 'flex',
                              }}
                            >
                              No Image
                            </div>
                          </div>

                          {/* Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={styles.appareilName}>{item.name || 'Unnamed Equipment'}</h4>
                            <div style={styles.appareilMeta}>
                              <span>Serial/Number:</span>
                              <span style={styles.appareilSerial}>
                                {item.number || item.num || item.serialNumber || 'N/A'}
                              </span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={styles.noAppareils}>No equipment attached to this transaction.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline CSS Styles Object
const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#030712',
    color: '#f8fafc',
    padding: '40px 24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  mainWrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #1e293b',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: '800',
    margin: 0,
    color: '#ffffff',
    letterSpacing: '-0.025em',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    marginTop: '4px',
    margin: 0,
  },
  totalBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    color: '#818cf8',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '13px',
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#030712',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #4f46e5',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorBox: {
    maxWidth: '500px',
    margin: '60px auto',
    padding: '24px',
    backgroundColor: 'rgba(159, 18, 57, 0.3)',
    border: '1px solid #9f1239',
    color: '#fecdd3',
    borderRadius: '12px',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    padding: '48px',
    textAlign: 'center',
    borderRadius: '16px',
    color: '#94a3b8',
  },
  card: {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  },
  cardTopBar: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    padding: '16px 24px',
    borderBottom: '1px solid #1e293b',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  idBadge: {
    fontSize: '12px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    padding: '6px 10px',
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    borderRadius: '8px',
  },
  dateGroup: {
    display: 'flex',
    gap: '24px',
    fontSize: '12px',
  },
  userBar: {
    padding: '12px 24px',
    backgroundColor: 'rgba(49, 46, 129, 0.2)',
    borderBottom: '1px solid rgba(30, 41, 59, 0.6)',
    fontSize: '13px',
    color: '#a5b4fc',
  },
  cardBody: {
    padding: '24px',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  },
  appareilsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  appareilItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    border: '1px solid rgba(30, 41, 59, 0.8)',
  },
  imageContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '10px',
    backgroundColor: '#1e293b',
    flexShrink: 0,
    overflow: 'hidden',
    border: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: '500',
    backgroundColor: '#1e293b',
  },
  appareilName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  appareilMeta: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#94a3b8',
    display: 'flex',
    gap: '6px',
  },
  appareilSerial: {
    fontFamily: 'monospace',
    color: '#818cf8',
    fontWeight: '600',
  },
  noAppareils: {
    fontSize: '13px',
    color: '#64748b',
    fontStyle: 'italic',
    margin: 0,
  },
};