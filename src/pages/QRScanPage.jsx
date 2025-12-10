import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

function QRScanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get('qr');
  
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    class: '',
    assignmentType: '',
    amountRequested: 1,
    promoCode: '',
    phone: '',
    email: ''
  });

  const [promoDiscount, setPromoDiscount] = useState(0);
  const [validatingPromo, setValidatingPromo] = useState(false);

  useEffect(() => {
    if (qrToken) {
      verifyCard();
    }
  }, [qrToken]);

  const verifyCard = async () => {
    try {
      setLoading(true);
      const cardsRef = collection(db, 'cards');
      const q = query(cardsRef, where('qrToken', '==', qrToken));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid QR code. Card not found.');
        return;
      }

      const cardDoc = querySnapshot.docs[0];
      const cardData = { id: cardDoc.id, ...cardDoc.data() };

      if (cardData.status === 'revoked') {
        setError('This card has been revoked and is no longer valid.');
        return;
      }

      if (cardData.expiresAt && new Date(cardData.expiresAt) < new Date()) {
        setError('This card has expired.');
        return;
      }

      setCard(cardData);
    } catch (err) {
      console.error('Error verifying card:', err);
      setError('Error verifying card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validatePromoCode = async () => {
    if (!formData.promoCode.trim()) {
      setPromoDiscount(0);
      return;
    }

    setValidatingPromo(true);
    try {
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, where('code', '==', formData.promoCode.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid promo code.');
        setPromoDiscount(0);
        setValidatingPromo(false);
        return;
      }

      const couponData = querySnapshot.docs[0].data();
      if (couponData.usesLeft <= 0) {
        setError('This promo code has been fully used.');
        setPromoDiscount(0);
        setValidatingPromo(false);
        return;
      }

      setPromoDiscount(couponData.discount);
      setError('');
    } catch (err) {
      console.error('Error validating promo:', err);
      setError('Error validating promo code.');
      setPromoDiscount(0);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone && !formData.email) {
      setError('Please provide either phone or email.');
      return;
    }

    if (!formData.class || !formData.assignmentType) {
      setError('Please fill all required fields.');
      return;
    }

    const finalAmount = Math.max(1, formData.amountRequested - promoDiscount);

    if (finalAmount > card.amount) {
      setError(`Insufficient balance. Card has ${card.amount} assignments remaining.`);
      return;
    }

    try {
      setLoading(true);
      
      // Create submission
      const submissionData = {
        cardId: card.id,
        cardTitle: card.title,
        cardTo: card.to,
        class: formData.class,
        assignmentType: formData.assignmentType,
        amountRequested: finalAmount,
        originalAmount: formData.amountRequested,
        promoCode: formData.promoCode.trim().toUpperCase() || null,
        promoDiscount: promoDiscount,
        phone: formData.phone || null,
        email: formData.email || null,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const submissionRef = await addDoc(collection(db, 'submissions'), submissionData);
      
      // Create event log
      await addDoc(collection(db, 'events'), {
        type: 'submissionCreated',
        data: { submissionId: submissionRef.id, cardId: card.id },
        timestamp: new Date().toISOString()
      });

      // Update coupon uses if promo code was used
      if (formData.promoCode.trim() && promoDiscount > 0) {
        const couponsRef = collection(db, 'coupons');
        const q = query(couponsRef, where('code', '==', formData.promoCode.trim().toUpperCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const couponDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'coupons', couponDoc.id), {
            usesLeft: increment(-1)
          });
        }
      }

      setSuccess('Request submitted successfully!');
      
      // Navigate to status page after a delay
      setTimeout(() => {
        navigate(`/status/${submissionRef.id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting request:', err);
      setError('Error submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!qrToken) {
    return (
      <div className="container">
        <div className="card" style={{ marginTop: '40px' }}>
          <h2>Invalid Access</h2>
          <p>Please scan a valid QR code to access this page.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className="container">
        <div className="card" style={{ marginTop: '40px' }}>
          <div className="alert alert-error">{error}</div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ marginTop: '40px' }}>
        <h1 style={{ marginBottom: '20px' }}>Submit Assignment Request</h1>
        
        {card && (
          <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '12px' }}>Card Details</h3>
            <p><strong>Title:</strong> {card.title}</p>
            <p><strong>To:</strong> {card.to}</p>
            <p><strong>Remaining Balance:</strong> {card.amount} assignments</p>
            <span className={`badge badge-${card.status}`}>
              {card.status.toUpperCase()}
            </span>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Class *</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              placeholder="e.g., CS 101"
              required
            />
          </div>

          <div className="form-group">
            <label>Assignment Type *</label>
            <input
              type="text"
              value={formData.assignmentType}
              onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
              placeholder="e.g., Homework, Project, Quiz"
              required
            />
          </div>

          <div className="form-group">
            <label>Amount Requested *</label>
            <input
              type="number"
              min="1"
              max={card?.amount || 1}
              value={formData.amountRequested}
              onChange={(e) => setFormData({ ...formData, amountRequested: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label>Promo Code (Optional)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                placeholder="Enter promo code"
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={validatePromoCode}
                disabled={validatingPromo || !formData.promoCode.trim()}
              >
                {validatingPromo ? 'Validating...' : 'Apply'}
              </button>
            </div>
            {promoDiscount > 0 && (
              <p style={{ color: 'green', marginTop: '8px' }}>
                Discount applied: -{promoDiscount} assignments
              </p>
            )}
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

          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            * At least one contact method (phone or email) is required
          </p>

          {promoDiscount > 0 && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#d1ecf1', borderRadius: '4px' }}>
              <strong>Final Amount:</strong> {Math.max(1, formData.amountRequested - promoDiscount)} assignments
              (Original: {formData.amountRequested}, Discount: -{promoDiscount})
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-success"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default QRScanPage;
