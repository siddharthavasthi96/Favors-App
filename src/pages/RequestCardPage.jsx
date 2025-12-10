import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

function RequestCardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    phone: '',
    email: '',
    reason: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone && !formData.email) {
      setError('Please provide either phone or email.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const requestData = {
        name: formData.name,
        class: formData.class,
        phone: formData.phone || null,
        email: formData.email || null,
        reason: formData.reason || null,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const requestRef = await addDoc(collection(db, 'cardRequests'), requestData);
      
      // Create event log
      await addDoc(collection(db, 'events'), {
        type: 'cardRequestCreated',
        data: { requestId: requestRef.id },
        timestamp: new Date().toISOString()
      });

      setSuccess('Card request submitted successfully!');
      setFormData({
        name: '',
        class: '',
        phone: '',
        email: '',
        reason: ''
      });

      setTimeout(() => {
        navigate(`/status/${requestRef.id}?type=cardRequest`);
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting card request:', err);
      setError('Error submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ marginTop: '40px' }}>
        <h1 style={{ marginBottom: '20px' }}>Request an Assignment Card</h1>
        <p style={{ marginBottom: '24px', color: '#666' }}>
          Fill out this form to request a new assignment card. An admin will review your request.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Class *</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              placeholder="e.g., CS 101, Grade 10"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Your phone number"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Your email address"
            />
          </div>

          <div className="form-group">
            <label>Reason (Optional)</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Why do you need an assignment card?"
              rows="4"
            />
          </div>

          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            * At least one contact method (phone or email) is required
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestCardPage;
