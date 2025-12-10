import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy, increment } from 'firebase/firestore';

function SubmissionManagement() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const submissionsRef = collection(db, 'submissions');
      const q = query(submissionsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const submissionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Error loading submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId) => {
    try {
      setLoading(true);
      const submission = submissions.find(s => s.id === submissionId);
      
      // Update submission status
      await updateDoc(doc(db, 'submissions', submissionId), {
        status: 'approved',
        approvedAt: new Date().toISOString()
      });

      // Deduct from card amount
      await updateDoc(doc(db, 'cards', submission.cardId), {
        amount: increment(-submission.amountRequested)
      });

      setSuccess('Submission approved successfully!');
      fetchSubmissions();
    } catch (err) {
      console.error('Error approving submission:', err);
      setError('Error approving submission.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (submissionId) => {
    if (!confirm('Are you sure you want to deny this submission?')) return;
    
    try {
      setLoading(true);
      await updateDoc(doc(db, 'submissions', submissionId), {
        status: 'denied',
        deniedAt: new Date().toISOString()
      });

      setSuccess('Submission denied.');
      fetchSubmissions();
    } catch (err) {
      console.error('Error denying submission:', err);
      setError('Error denying submission.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Card Title', 'Class', 'Assignment Type', 'Amount', 'Status', 'Contact', 'Created'];
    const rows = submissions.map(sub => [
      sub.id,
      sub.cardTitle,
      sub.class,
      sub.assignmentType,
      sub.amountRequested,
      sub.status,
      sub.phone || sub.email,
      new Date(sub.createdAt).toLocaleString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Submission Management</h2>
        <button 
          className="btn btn-primary"
          onClick={exportToCSV}
        >
          Export to CSV
        </button>
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

      {!loading && filteredSubmissions.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          No submissions found.
        </p>
      )}

      {!loading && filteredSubmissions.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Card</th>
              <th>Class</th>
              <th>Assignment</th>
              <th>Amount</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map(sub => (
              <tr key={sub.id}>
                <td>
                  <div>
                    <strong>{sub.cardTitle}</strong>
                    <br />
                    <small>To: {sub.cardTo}</small>
                  </div>
                </td>
                <td>{sub.class}</td>
                <td>{sub.assignmentType}</td>
                <td>
                  {sub.amountRequested}
                  {sub.promoCode && (
                    <small style={{ display: 'block', color: '#666' }}>
                      Promo: {sub.promoCode}
                    </small>
                  )}
                </td>
                <td>
                  {sub.phone && <div>📞 {sub.phone}</div>}
                  {sub.email && <div>📧 {sub.email}</div>}
                </td>
                <td>
                  <span className={`badge badge-${sub.status}`}>
                    {sub.status.toUpperCase()}
                  </span>
                </td>
                <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td>
                  {sub.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleApprove(sub.id)}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeny(sub.id)}
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

export default SubmissionManagement;
