import { Outlet } from 'react-router-dom';

const Movie = () => {
  return (
    <div className="movie-page">
      <header className="movie-header">
        <h1>Movie Page</h1>
      </header>
      <div className="movie-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Movie;
