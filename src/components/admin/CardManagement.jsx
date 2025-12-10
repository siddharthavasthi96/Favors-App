import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

function CardManagement() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    to: '',
    amount: 20,
    expiresAt: ''
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const cardsRef = collection(db, 'cards');
      const q = query(cardsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const cardsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCards(cardsData);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Error loading cards.');
    } finally {
      setLoading(false);
    }
  };

  const generateQRToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const generatePDF = async (card) => {
    try {
      const qrToken = card.qrToken;
      const qrUrl = `${window.location.origin}/?qr=${qrToken}`;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2
      });

      // Create PDF
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(24);
      pdf.text('Assignment Card', 105, 30, { align: 'center' });
      
      // Add card details
      pdf.setFontSize(14);
      pdf.text(`Title: ${card.title}`, 20, 50);
      pdf.text(`To: ${card.to}`, 20, 60);
      pdf.text(`Amount: ${card.amount} assignments`, 20, 70);
      
      // Add QR code
      pdf.addImage(qrDataUrl, 'PNG', 55, 90, 100, 100);
      
      // Add instructions
      pdf.setFontSize(10);
      pdf.text('Scan this QR code to submit assignment requests', 105, 200, { align: 'center' });
      pdf.text(`Token: ${qrToken}`, 105, 210, { align: 'center' });
      
      // Save PDF
      pdf.save(`card-${card.id}.pdf`);
      
      setSuccess('PDF generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Error generating PDF.');
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const qrToken = generateQRToken();
      
      const cardData = {
        title: formData.title,
        to: formData.to,
        amount: parseInt(formData.amount),
        qrToken: qrToken,
        status: 'active',
        createdAt: new Date().toISOString(),
        ...(formData.expiresAt && { expiresAt: new Date(formData.expiresAt).toISOString() })
      };

      const cardRef = await addDoc(collection(db, 'cards'), cardData);
      
      // Create event log
      await addDoc(collection(db, 'events'), {
        type: 'cardCreated',
        data: { cardId: cardRef.id },
        timestamp: new Date().toISOString()
      });

      setSuccess('Card created successfully!');
      setFormData({ title: '', to: '', amount: 20, expiresAt: '' });
      setShowCreateForm(false);
      
      // Generate PDF for the new card
      const newCard = { id: cardRef.id, ...cardData };
      await generatePDF(newCard);
      
      fetchCards();
    } catch (err) {
      console.error('Error creating card:', err);
      setError('Error creating card.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCard = async (cardId) => {
    if (!confirm('Are you sure you want to revoke this card?')) return;
    
    try {
      setLoading(true);
      await updateDoc(doc(db, 'cards', cardId), {
        status: 'revoked'
      });
      
      // Create event log
      await addDoc(collection(db, 'events'), {
        type: 'cardRevoked',
        data: { cardId },
        timestamp: new Date().toISOString()
      });

      setSuccess('Card revoked successfully!');
      fetchCards();
    } catch (err) {
      console.error('Error revoking card:', err);
      setError('Error revoking card.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to permanently delete this card? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'cards', cardId));
      
      // Create event log
      await addDoc(collection(db, 'events'), {
        type: 'cardDeleted',
        data: { cardId },
        timestamp: new Date().toISOString()
      });

      setSuccess('Card deleted successfully!');
      fetchCards();
    } catch (err) {
      console.error('Error deleting card:', err);
      setError('Error deleting card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Card Management</h2>
        <button 
          className="btn btn-success"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Card'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showCreateForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Create New Card</h3>
          <form onSubmit={handleCreateCard}>
            <div className="form-group">
              <label>Card Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Spring 2024 Card"
                required
              />
            </div>

            <div className="form-group">
              <label>To (Recipient Name) *</label>
              <input
                type="text"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Amount (in $) *</label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                Increments of $5. ($5 = 0.25, $10 = 0.5, $20 = 1 assignment)
              </small>
            </div>

            <div className="form-group">
              <label>Expiration Date (Optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                Leave empty for no expiration
              </small>
            </div>

            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Creating...' : 'Create Card & Generate PDF'}
            </button>
          </form>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}

      {!loading && cards.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          No cards found. Create your first card!
        </p>
      )}

      {!loading && cards.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>To</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(card => {
              const isExpired = card.expiresAt && new Date(card.expiresAt) < new Date();
              return (
                <tr key={card.id} style={isExpired ? { opacity: 0.6 } : {}}>
                  <td>{card.title}</td>
                  <td>{card.to}</td>
                  <td>${card.amount} ({(card.amount / 20).toFixed(2)} assignments)</td>
                  <td>
                    <span className={`badge badge-${card.status}`}>
                      {card.status.toUpperCase()}
                    </span>
                    {isExpired && (
                      <span className="badge badge-revoked" style={{ marginLeft: '4px' }}>
                        EXPIRED
                      </span>
                    )}
                  </td>
                  <td>{new Date(card.createdAt).toLocaleDateString()}</td>
                  <td>
                    {card.expiresAt 
                      ? new Date(card.expiresAt).toLocaleDateString()
                      : 'No expiration'}
                  </td>
                  <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => generatePDF(card)}
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      Download PDF
                    </button>
                    {card.status === 'active' && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleRevokeCard(card.id)}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                      >
                        Revoke
                      </button>
                    )}
                    {card.status === 'revoked' && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteCard(card.id)}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CardManagement;
