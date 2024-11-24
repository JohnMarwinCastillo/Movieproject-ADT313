import axios from 'axios';
import { useState, useEffect } from 'react';
import './Photos.css';

const Photos = ({ movieId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch images from the TMDb API
  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios({
        method: 'get',
        url: `https://api.themoviedb.org/3/movie/${movieId}/images`,
        headers: {
          accept: 'application/json',
        },
      });

      setImages(response.data.images || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) fetchImages();
  }, [movieId]);

  return (
    <div className="photos">
      <h2>Movie Images</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && images.length === 0 && (
        <p>No images available for this movie.</p>
      )}

      <div className="image-grid">
        {images.map((image) => (
          <div key={image.file_path} className="image-item">
            <img
              src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
              alt="Movie scene"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Photos;
