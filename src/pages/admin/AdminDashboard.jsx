import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CardManagement from '../../components/admin/CardManagement';
import SubmissionManagement from '../../components/admin/SubmissionManagement';
import CouponManagement from '../../components/admin/CouponManagement';
import CardRequestManagement from '../../components/admin/CardRequestManagement';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cards');

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = sessionStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminKey');
    navigate('/admin');
  };

  return (
    <div className="container">
      <div style={{ 
        background: 'white', 
        padding: '16px 24px', 
        marginBottom: '20px', 
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Public Site
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          borderBottom: '2px solid #e0e0e0',
          background: '#f8f9fa'
        }}>
          <button
            onClick={() => setActiveTab('cards')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: activeTab === 'cards' ? 'white' : 'transparent',
              borderBottom: activeTab === 'cards' ? '3px solid #007bff' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'cards' ? '600' : '400',
              fontSize: '16px'
            }}
          >
            Cards
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: activeTab === 'submissions' ? 'white' : 'transparent',
              borderBottom: activeTab === 'submissions' ? '3px solid #007bff' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'submissions' ? '600' : '400',
              fontSize: '16px'
            }}
          >
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: activeTab === 'coupons' ? 'white' : 'transparent',
              borderBottom: activeTab === 'coupons' ? '3px solid #007bff' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'coupons' ? '600' : '400',
              fontSize: '16px'
            }}
          >
            Coupons
          </button>
          <button
            onClick={() => setActiveTab('cardRequests')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: activeTab === 'cardRequests' ? 'white' : 'transparent',
              borderBottom: activeTab === 'cardRequests' ? '3px solid #007bff' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'cardRequests' ? '600' : '400',
              fontSize: '16px'
            }}
          >
            Card Requests
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'cards' && <CardManagement />}
          {activeTab === 'submissions' && <SubmissionManagement />}
          {activeTab === 'coupons' && <CouponManagement />}
          {activeTab === 'cardRequests' && <CardRequestManagement />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
