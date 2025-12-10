import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

function StatusPage() {
  const { shortId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'submission';
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatus();
  }, [shortId, type]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const collectionName = type === 'cardRequest' ? 'cardRequests' : 'submissions';
      const docRef = doc(db, collectionName, shortId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError('Status not found.');
        return;
      }

      setData({ id: docSnap.id, ...docSnap.data() });
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Error loading status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
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

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ marginTop: '40px' }}>
        <h1 style={{ marginBottom: '20px' }}>
          {type === 'cardRequest' ? 'Card Request Status' : 'Submission Status'}
        </h1>

        {data && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span className={`badge badge-${data.status}`} style={{ fontSize: '16px', padding: '8px 16px' }}>
                {data.status.toUpperCase()}
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '12px' }}>Details</h3>
              <table style={{ width: '100%' }}>
                <tbody>
                  {type === 'cardRequest' ? (
                    <>
                      <tr>
                        <td style={{ padding: '8px', fontWeight: '600' }}>Name:</td>
                        <td style={{ padding: '8px' }}>{data.name}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', fontWeight: '600' }}>Class:</td>
                        <td style={{ padding: '8px' }}>{data.class}</td>
                      </tr>
                      {data.phone && (
                        <tr>
                          <td style={{ padding: '8px', fontWeight: '600' }}>Phone:</td>
                          <td style={{ padding: '8px' }}>{data.phone}</td>
                        </tr>
                      )}
                      {data.email && (
                        <tr>
                          <td style={{ padding: '8px', fontWeight: '600' }}>Email:</td>
                          <td style={{ padding: '8px' }}>{data.email}</td>
                        </tr>
                      )}
                      {data.reason && (
                        <tr>
                          <td style={{ padding: '8px', fontWeight: '600' }}>Reason:</td>
                          <td style={{ padding: '8px' }}>{data.reason}</td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <>
                      <tr>
                        <td style={{ padding: '8px', fontWeight: '600' }}>Card Title:</td>
                        <td style={{ padding: '8px' }}>{data.cardTitle}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', fontWeight: '600' }}>Card To:</td>
                        <td style={{ padding: '8px' }}>{data.cardTo}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', fontWeight: '600' }}>Class:</td>
                        <td style={{ padding: '8px' }}>{data.class}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', fontWeight: '600' }}>Assignment Type:</td>
                        <td style={{ padding: '8px' }}>{data.assignmentType}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', fontWeight: '600' }}>Amount:</td>
                        <td style={{ padding: '8px' }}>{data.amountRequested} assignments</td>
                      </tr>
                      {data.promoCode && (
                        <tr>
                          <td style={{ padding: '8px', fontWeight: '600' }}>Promo Code:</td>
                          <td style={{ padding: '8px' }}>{data.promoCode} (-{data.promoDiscount})</td>
                        </tr>
                      )}
                      {data.phone && (
                        <tr>
                          <td style={{ padding: '8px', fontWeight: '600' }}>Phone:</td>
                          <td style={{ padding: '8px' }}>{data.phone}</td>
                        </tr>
                      )}
                      {data.email && (
                        <tr>
                          <td style={{ padding: '8px', fontWeight: '600' }}>Email:</td>
                          <td style={{ padding: '8px' }}>{data.email}</td>
                        </tr>
                      )}
                    </>
                  )}
                  <tr>
                    <td style={{ padding: '8px', fontWeight: '600' }}>Submitted:</td>
                    <td style={{ padding: '8px' }}>{formatDate(data.createdAt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {data.status === 'pending' && (
              <div className="alert alert-info">
                Your {type === 'cardRequest' ? 'card request' : 'submission'} is pending review. 
                You will be notified once it has been processed.
              </div>
            )}

            {data.status === 'approved' && (
              <div className="alert alert-success">
                Your {type === 'cardRequest' ? 'card request' : 'submission'} has been approved!
              </div>
            )}

            {data.status === 'denied' && (
              <div className="alert alert-error">
                Your {type === 'cardRequest' ? 'card request' : 'submission'} has been denied.
              </div>
            )}

            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/')}
              style={{ marginTop: '16px' }}
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusPage;
