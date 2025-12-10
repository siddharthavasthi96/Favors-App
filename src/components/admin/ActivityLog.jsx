import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

function ActivityLog() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maxEvents, setMaxEvents] = useState(50);

  useEffect(() => {
    fetchEvents();
  }, [maxEvents]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('timestamp', 'desc'), limit(maxEvents));
      const querySnapshot = await getDocs(q);
      
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Error loading activity log.');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'cardCreated': return '🎴';
      case 'cardRevoked': return '🚫';
      case 'submissionCreated': return '📝';
      case 'submissionApproved': return '✅';
      case 'submissionDenied': return '❌';
      case 'cardRequestCreated': return '📋';
      case 'cardRequestApproved': return '✅';
      case 'cardRequestDenied': return '❌';
      default: return '📌';
    }
  };

  const getEventDescription = (event) => {
    switch (event.type) {
      case 'cardCreated':
        return `New card created (ID: ${event.data.cardId?.substring(0, 8)}...)`;
      case 'cardRevoked':
        return `Card revoked (ID: ${event.data.cardId?.substring(0, 8)}...)`;
      case 'submissionCreated':
        return `New submission created (ID: ${event.data.submissionId?.substring(0, 8)}...)`;
      case 'submissionApproved':
        return `Submission approved - ${event.data.amount} assignments (ID: ${event.data.submissionId?.substring(0, 8)}...)`;
      case 'submissionDenied':
        return `Submission denied (ID: ${event.data.submissionId?.substring(0, 8)}...)`;
      case 'cardRequestCreated':
        return `New card request (ID: ${event.data.requestId?.substring(0, 8)}...)`;
      case 'cardRequestApproved':
        return `Card request approved (ID: ${event.data.requestId?.substring(0, 8)}...)`;
      case 'cardRequestDenied':
        return `Card request denied (ID: ${event.data.requestId?.substring(0, 8)}...)`;
      default:
        return `Unknown event: ${event.type}`;
    }
  };

  const formatDate = (timestamp) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return timestamp;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Activity Log</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label>Show:</label>
          <select 
            value={maxEvents}
            onChange={(e) => setMaxEvents(parseInt(e.target.value))}
            style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value={25}>25 events</option>
            <option value={50}>50 events</option>
            <option value={100}>100 events</option>
            <option value={200}>200 events</option>
          </select>
          <button 
            className="btn btn-primary"
            onClick={fetchEvents}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <div className="loading">Loading...</div>}

      {!loading && events.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          No activity recorded yet.
        </p>
      )}

      {!loading && events.length > 0 && (
        <div>
          {events.map(event => (
            <div 
              key={event.id}
              style={{
                padding: '12px 16px',
                marginBottom: '8px',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '24px' }}>{getEventIcon(event.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                  {getEventDescription(event)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatDate(event.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityLog;
