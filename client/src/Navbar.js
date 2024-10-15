import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">Mon Application</Link>
      <div className="collapse navbar-collapse">
        {user && (
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Tableau de bord</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/leaderboard">Classement</Link>
            </li>
          </ul>
        )}
        <span className="navbar-text">
          {user ? `Connecté en tant que ${user.username}` : null}
        </span>
      </div>
    </nav>
  );
}

export default Navbar;
