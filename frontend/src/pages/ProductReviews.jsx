import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

function ProductReviews() {
    const { productId } = useParams();
    const { user } = useAuth();

    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchReviews = async () => {
        try {
            setLoading(true);

            const response = await API.get(`/reviews/${productId}`);

            setReviews(response.data.reviews || []);
        } catch (err) {
            setError(
                err.response?.data?.message || 'Unable to load reviews.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage('');
        setError('');

        try {
            await API.post('/reviews', {
                productId,
                rating: Number(rating),
                comment
            });

            setMessage('Review submitted successfully!');
            setComment('');
            setRating(5);

            await fetchReviews();
        } catch (err) {
            setError(
                err.response?.data?.message || 'Unable to submit review.'
            );
        }
    };

    if (loading) {
        return <div className="reviews-container">Loading reviews...</div>;
    }

    return (
        <div className="reviews-container">
            <Link to="/" className="back-link">
                ← Back to Products
            </Link>

            <h2>Customer Reviews</h2>

            {reviews.length === 0 ? (
                <p>No reviews yet. Be the first to review this product!</p>
            ) : (
                <div className="reviews-list">
                    {reviews.map((review) => (
                        <div className="review-card" key={review._id}>
                            <div className="review-header">
                                <h3>
                                    {review.buyer?.name || 'Customer'}
                                </h3>

                                {review.verifiedPurchase && (
                                    <span className="verified-badge">
                                        ✓ Verified Buyer
                                    </span>
                                )}
                            </div>

                            <div className="review-rating">
                                {'⭐'.repeat(review.rating)}
                            </div>

                            <p>{review.comment}</p>

                            <small>
                                {new Date(
                                    review.createdAt
                                ).toLocaleDateString()}
                            </small>
                        </div>
                    ))}
                </div>
            )}

            {user && (
                <div className="review-form">
                    <h3>Write a Review</h3>

                    <form onSubmit={handleSubmit}>
                        <label>Rating</label>

                        <select
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                        >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very Good</option>
                            <option value="3">3 - Good</option>
                            <option value="2">2 - Fair</option>
                            <option value="1">1 - Poor</option>
                        </select>

                        <label>Your Review</label>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            minLength="3"
                            maxLength="500"
                            required
                        />

                        <button type="submit">
                            Submit Review
                        </button>
                    </form>
                </div>
            )}

            {!user && (
                <p>
                    <Link to="/login">Login</Link> to write a review.
                </p>
            )}

            {message && (
                <p className="success-message">{message}</p>
            )}

            {error && (
                <p className="error-message">{error}</p>
            )}
        </div>
    );
}

export default ProductReviews;