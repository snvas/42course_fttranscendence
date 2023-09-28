import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container">
      <div className="error-page-wrapper">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <br></br>
        <div>
          <Link id="home-lunk" to="/">Go to Home Page</Link>
        </div>

      </div>
    </div>
  );
}

export default NotFound;