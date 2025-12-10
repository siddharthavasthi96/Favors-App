import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get('qr');

  useEffect(() => {
    if (qrToken) {
      navigate(`/?qr=${qrToken}`);
    }
  }, [qrToken, navigate]);

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
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/admin')}
          >
            Admin Login
          </button>
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
