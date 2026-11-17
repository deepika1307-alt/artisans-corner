import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="footer">

            <div className="footer-container">

                <div className="footer-brand">
                    <h2>Artisan's Corner <span>✿</span></h2>

                    <p>
                        Celebrating creativity, craftsmanship and
                        the beautiful stories behind handmade products.
                    </p>
                </div>

                <div className="footer-links">
                    <h3>Explore</h3>
                    <Link to="/">Home</Link>
                    <Link to="/#explore">Discover Products</Link>
                    <Link to="/register">Become a Seller</Link>
                </div>

                <div className="footer-links">
                    <h3>Account</h3>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Create Account</Link>
                </div>

                <div className="footer-contact">
                    <h3>Our Promise</h3>
                    <p>Handmade with love.</p>
                    <p>Created with passion.</p>
                    <p>Delivered with care.</p>
                </div>

            </div>

            <div className="footer-bottom">
                <p>
                    © {new Date().getFullYear()} Artisan's Corner.
                    All rights reserved.
                </p>
                <p>Made for the love of handmade crafts ✿</p>
            </div>

        </footer>
    );
}

export default Footer;