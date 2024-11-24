import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Videos.css';

const Videos = ({ movieId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
          {
            headers: {
              accept: 'application/json',
            },
          }
        );
        setVideos(response.data.results || []);
      } catch (error) {
        setError('Failed to load videos.');
      } finally {
        setLoading(false);
      }
    };

    if (movieId) fetchVideos();
  }, [movieId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="videos">
      <h2>Movie Videos</h2>
      <div className="video-grid">
        {videos.map((video) => (
          <div key={video.id} className="video-item">
            <iframe
              src={`https://www.youtube.com/embed/${video.key}`}
              title={video.name}
              allowFullScreen
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Videos;
