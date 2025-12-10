import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    discount: 5,
    usesLeft: 10
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const couponsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCoupons(couponsData);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Error loading coupons.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const couponData = {
        code: formData.code.toUpperCase(),
        discount: parseInt(formData.discount),
        usesLeft: parseInt(formData.usesLeft),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'coupons'), couponData);

      setSuccess('Coupon created successfully!');
      setFormData({ code: '', discount: 5, usesLeft: 10 });
      setShowCreateForm(false);
      fetchCoupons();
    } catch (err) {
      console.error('Error creating coupon:', err);
      setError('Error creating coupon.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'coupons', couponId));
      setSuccess('Coupon deleted successfully!');
      fetchCoupons();
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError('Error deleting coupon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Coupon Management</h2>
        <button 
          className="btn btn-success"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Coupon'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showCreateForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Create New Coupon</h3>
          <form onSubmit={handleCreateCoupon}>
            <div className="form-group">
              <label>Coupon Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SAVE10"
                required
              />
            </div>

            <div className="form-group">
              <label>Discount (in $) *</label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                required
              />
              <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                Increments of $5
              </small>
            </div>

            <div className="form-group">
              <label>Uses Left *</label>
              <input
                type="number"
                min="1"
                value={formData.usesLeft}
                onChange={(e) => setFormData({ ...formData, usesLeft: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Creating...' : 'Create Coupon'}
            </button>
          </form>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}

      {!loading && coupons.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          No coupons found. Create your first coupon!
        </p>
      )}

      {!loading && coupons.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Uses Left</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id}>
                <td><strong>{coupon.code}</strong></td>
                <td>${coupon.discount}</td>
                <td>{coupon.usesLeft}</td>
                <td>{new Date(coupon.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    style={{ padding: '6px 12px', fontSize: '14px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CouponManagement;
