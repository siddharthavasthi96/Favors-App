import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get('qr');
  
  const [checkToken, setCheckToken] = useState('');
  const [cardInfo, setCardInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (qrToken) {
      navigate(`/?qr=${qrToken}`);
    }
  }, [qrToken, navigate]);

  const handleCheckBalance = async (e) => {
    e.preventDefault();
    if (!checkToken.trim()) return;

    try {
      setLoading(true);
      setError('');
      setCardInfo(null);
      
      const cardsRef = collection(db, 'cards');
      const q = query(cardsRef, where('qrToken', '==', checkToken.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Card not found. Please check the token.');
        return;
      }

      const cardDoc = querySnapshot.docs[0];
      const cardData = { id: cardDoc.id, ...cardDoc.data() };
      setCardInfo(cardData);
    } catch (err) {
      console.error('Error checking card:', err);
      setError('Error checking card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (qrToken) {
    return <QRScanPageContent qrToken={qrToken} />;
  }

  return (
    <div className="container">
      <div className="card" style={{ marginTop: '40px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px' }}>Assignment Cards</h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          QR Voucher System for Assignment Help
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/request-card')}
          >
            Request a Card
          </button>
        </div>

        <div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '16px' }}>Check Card Balance</h3>
          <form onSubmit={handleCheckBalance} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <input
                type="text"
                value={checkToken}
                onChange={(e) => setCheckToken(e.target.value)}
                placeholder="Enter card token"
                style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  width: '300px'
                }}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !checkToken.trim()}
              >
                {loading ? 'Checking...' : 'Check'}
              </button>
            </div>
          </form>

          {error && <div className="alert alert-error" style={{ maxWidth: '500px', margin: '0 auto' }}>{error}</div>}
          
          {cardInfo && (
            <div style={{ 
              padding: '16px', 
              background: 'white', 
              borderRadius: '8px',
              maxWidth: '500px',
              margin: '0 auto',
              textAlign: 'left'
            }}>
              <h4 style={{ marginBottom: '12px' }}>Card Details</h4>
              <p><strong>Title:</strong> {cardInfo.title}</p>
              <p><strong>To:</strong> {cardInfo.to}</p>
              <p><strong>Balance:</strong> ${cardInfo.amount}</p>
              <p><strong>Status:</strong> <span className={`badge badge-${cardInfo.status}`}>{cardInfo.status.toUpperCase()}</span></p>
              {cardInfo.expiresAt && (
                <p><strong>Expires:</strong> {new Date(cardInfo.expiresAt).toLocaleDateString()}</p>
              )}
              {cardInfo.status === 'active' && !cardInfo.expiresAt || (cardInfo.expiresAt && new Date(cardInfo.expiresAt) > new Date()) ? (
                <button 
                  className="btn btn-success"
                  onClick={() => navigate(`/?qr=${cardInfo.qrToken}`)}
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  Use This Card
                </button>
              ) : null}
            </div>
          )}
        </div>

        <div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '12px' }}>How it works</h3>
          <ol style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
            <li style={{ marginBottom: '8px' }}>Scan the QR code on your assignment card</li>
            <li style={{ marginBottom: '8px' }}>Fill out the assignment request form</li>
            <li style={{ marginBottom: '8px' }}>Wait for approval from the admin</li>
            <li>Check your status using the link provided</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Import QRScanPage component inline for now
import QRScanPageContent from './QRScanPage';

export default HomePage;
