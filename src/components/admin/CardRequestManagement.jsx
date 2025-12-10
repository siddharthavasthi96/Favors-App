import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy, addDoc } from 'firebase/firestore';

function CardRequestManagement() {
  const [cardRequests, setCardRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCardRequests();
  }, []);

  const fetchCardRequests = async () => {
    try {
      setLoading(true);
      const requestsRef = collection(db, 'cardRequests');
      const q = query(requestsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCardRequests(requestsData);
    } catch (err) {
      console.error('Error fetching card requests:', err);
      setError('Error loading card requests.');
    } finally {
      setLoading(false);
    }
  };

  const generateQRToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleApprove = async (requestId) => {
    const request = cardRequests.find(r => r.id === requestId);
    const amount = prompt('Enter the number of assignments for this card:', '5');
    
    if (!amount || isNaN(amount) || parseInt(amount) < 1) return;

    try {
      setLoading(true);
      
      // Create new card
      const qrToken = generateQRToken();
      const cardData = {
        title: `Card for ${request.name}`,
        to: request.name,
        amount: parseInt(amount),
        qrToken: qrToken,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      const cardRef = await addDoc(collection(db, 'cards'), cardData);
      
      // Update request status
      await updateDoc(doc(db, 'cardRequests', requestId), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        cardId: cardRef.id
      });

      // Create event log
      await addDoc(collection(db, 'events'), {
        type: 'cardRequestApproved',
        data: { requestId, cardId: cardRef.id },
        timestamp: new Date().toISOString()
      });

      setSuccess('Card request approved and card created successfully!');
      fetchCardRequests();
    } catch (err) {
      console.error('Error approving card request:', err);
      setError('Error approving card request.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (requestId) => {
    if (!confirm('Are you sure you want to deny this card request?')) return;
    
    try {
      setLoading(true);
      await updateDoc(doc(db, 'cardRequests', requestId), {
        status: 'denied',
        deniedAt: new Date().toISOString()
      });

      // Create event log
      await addDoc(collection(db, 'events'), {
        type: 'cardRequestDenied',
        data: { requestId },
        timestamp: new Date().toISOString()
      });

      setSuccess('Card request denied.');
      fetchCardRequests();
    } catch (err) {
      console.error('Error denying card request:', err);
      setError('Error denying card request.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = cardRequests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Card Request Management</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
        <button 
          className={filter === 'all' ? 'btn btn-primary' : 'btn btn-primary'}
          onClick={() => setFilter('all')}
          style={{ opacity: filter === 'all' ? 1 : 0.6 }}
        >
          All
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => setFilter('pending')}
          style={{ opacity: filter === 'pending' ? 1 : 0.6 }}
        >
          Pending
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => setFilter('approved')}
          style={{ opacity: filter === 'approved' ? 1 : 0.6 }}
        >
          Approved
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => setFilter('denied')}
          style={{ opacity: filter === 'denied' ? 1 : 0.6 }}
        >
          Denied
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}

      {!loading && filteredRequests.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          No card requests found.
        </p>
      )}

      {!loading && filteredRequests.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Class</th>
              <th>Contact</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(req => (
              <tr key={req.id}>
                <td><strong>{req.name}</strong></td>
                <td>{req.class}</td>
                <td>
                  {req.phone && <div>📞 {req.phone}</div>}
                  {req.email && <div>📧 {req.email}</div>}
                </td>
                <td>{req.reason || '-'}</td>
                <td>
                  <span className={`badge badge-${req.status}`}>
                    {req.status.toUpperCase()}
                  </span>
                </td>
                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                <td>
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleApprove(req.id)}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeny(req.id)}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CardRequestManagement;
