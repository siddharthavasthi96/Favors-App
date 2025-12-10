import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

function AdminLogin() {
  const navigate = useNavigate();
  const [securityKey, setSecurityKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      // Check if security key exists in Firestore
      const configRef = collection(db, 'config');
      const q = query(configRef, where('key', '==', 'adminSecurityKey'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // If no security key exists, create a default one
        setError('No admin security key configured. Please contact the system administrator.');
        setLoading(false);
        return;
      }

      const configData = querySnapshot.docs[0].data();
      
      if (configData.value === securityKey) {
        // Store in sessionStorage (simple auth)
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminKey', securityKey);
        navigate('/admin/dashboard');
      } else {
        setError('Invalid security key.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Error logging in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ marginTop: '40px', maxWidth: '500px', margin: '40px auto' }}>
        <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Admin Login</h1>
        
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Security Key</label>
            <input
              type="password"
              value={securityKey}
              onChange={(e) => setSecurityKey(e.target.value)}
              placeholder="Enter admin security key"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', fontSize: '14px' }}>
          <strong>Note:</strong> If this is the first time setting up the admin panel, 
          you need to manually create a security key in Firestore:
          <ol style={{ marginTop: '8px', marginLeft: '20px' }}>
            <li>Go to Firebase Console → Firestore Database</li>
            <li>Create a collection named "config"</li>
            <li>Add a document with fields: key="adminSecurityKey", value="your_secret_key"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
