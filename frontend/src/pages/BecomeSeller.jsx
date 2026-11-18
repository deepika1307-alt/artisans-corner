import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

function BecomeSeller() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        storeName: '',
        description: '',
        logo: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setLoading(true);

            await API.post('/stores/create', formData);

            alert('Your store has been created successfully!');

            // Refresh login to receive the updated seller role
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            window.location.href = '/login';

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to create your store.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-heading">
                    <span className="auth-icon">✿</span>
                    <h1>Become a Seller</h1>
                    <p>Create your own handmade store!</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Store Name</label>
                        <input
                            type="text"
                            name="storeName"
                            placeholder="Enter your store name"
                            value={formData.storeName}
                            onChange={handleChange}
                            minLength="3"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Store Description</label>
                        <textarea
                            name="description"
                            placeholder="Tell customers about your store..."
                            value={formData.description}
                            onChange={handleChange}
                            maxLength="500"
                            rows="4"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Store Logo URL (Optional)</label>
                        <input
                            type="url"
                            name="logo"
                            placeholder="Paste your logo image URL"
                            value={formData.logo}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating Store...' : 'Create My Store'}
                    </button>

                </form>

                <button
                    className="auth-back"
                    onClick={() => navigate('/')}
                >
                    ← Back to Home
                </button>

            </div>
        </div>
    );
}

export default BecomeSeller;