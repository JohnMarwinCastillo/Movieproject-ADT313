import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../../../../context/context";
import { useParams } from 'react-router-dom';
import './Videos.css';

function Videos() {
  const { auth } = useContext(AuthContext);
  const { movieId } = useParams();
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({ url: '', description: '' });
  const [editingVideo, setEditingVideo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const getYouTubeVideoId = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      console.error("URL is undefined, empty, or not a valid string:", url);
      return null;
    }

    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/\S+\/|(?:v|e(?:mbed)?)\/))?(?:watch\?v=|e(?:mbed)\/)([\w-]{11})|(?:youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);

    if (match) {
      return match[1] || match[2];
    }

    return null;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`/movies/${movieId}/videos`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });

        if (Array.isArray(response.data.videos)) {
          setVideos(response.data.videos);
        } else {
          console.error("Error: No videos found or videos is not an array");
          setVideos([]);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]);
      }
    };

    fetchVideos();
  }, [movieId, auth.accessToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingVideo) {
      setEditingVideo((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewVideo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddVideo = async () => {
    if (!newVideo.url || !newVideo.description) {
      alert("Please provide both a URL and a description for the video.");
      return;
    }

    console.log("URL to be processed:", newVideo.url);

    const videoId = getYouTubeVideoId(newVideo.url);

    if (!videoId) {
      alert("Please provide a valid YouTube URL.");
      return;
    }

    setIsSaving(true);
    try {
      const videoData = {
        movieId,
        url: newVideo.url,
        description: newVideo.description,
        userId: auth.user.userId,
      };

      const response = await axios.post('/videos', videoData, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });

      setVideos((prevVideos) => [...prevVideos, response.data]);

      setNewVideo({ url: '', description: '' });

      alert("Video added successfully!");

      window.location.reload();
    } catch (error) {
      console.error("Error adding video:", error);
      alert("Failed to add video.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await axios.delete(`/videos/${id}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });

        setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
        alert("Video deleted successfully!");
      } catch (error) {
        console.error("Error deleting video:", error);
        alert("Failed to delete video.");
      }
    }
  };

  const handleUpdateVideo = async () => {
    const validateFields = () => {
      if (!editingVideo.url) {
        alert("Please provide a valid URL.");
        return false;
      }
      if (!editingVideo.description) {
        alert("Please provide a description.");
        return false;
      }
      return true;
    };
  
    if (!validateFields()) {
      return;
    } else {
      const isConfirm = window.confirm("Are you sure you want to update the video?");
      if (isConfirm) {
        const updatedData = {
          id: editingVideo.id,
          url: editingVideo.url,
          description: editingVideo.description,
          movieId: editingVideo.movieId,
        };
  
        console.log("Updated video data:", updatedData);

        try {
          const response = await axios({
            method: 'patch',
            url: `/videos/${editingVideo.id}`,
            data: updatedData,
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
  
          alert("Video updated successfully!");
  
          setVideos((prevVideos) =>
            prevVideos.map((video) =>
              video.id === editingVideo.id ? { ...video, ...updatedData } : video
            )
          );
  
          setEditingVideo(null);
        } catch (error) {
          if (error.response) {
            alert(`Error updating video: ${error.response.data.message || 'Unknown error'}`);
          } else if (error.request) {
            alert("No response received from the server. Please try again later.");
          } else {
            alert("An unexpected error occurred. Please try again.");
          }
        }
      }
    }
  };

  return (
    <div className="video-box">
      <div className="Video-View-Box">
        <h2>Videos for Movie</h2>

        <div className="card-display-videos">
          {videos.length === 0 ? (
            <p>No videos found for this movie.</p>
          ) : (
            videos.map((video) => {
              const videoId = getYouTubeVideoId(video.url);
              return (
                <div key={video.id} className="card-video">
                  {videoId ? (
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <p>Invalid video URL</p>
                  )}
                  <div className="container-video">
                    <h4>{video.description}</h4>
                    <p>Added on: {new Date(video.dateCreated).toLocaleDateString()}</p>
                    <div className="buttons-group">
                      <button className="edit-button" onClick={() => setEditingVideo(video)}>
                        Edit
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteVideo(video.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      
        videoData={editingVideo ? editingVideo : newVideo}
        onSubmit={editingVideo ? handleUpdateVideo : handleAddVideo}
        onChange={handleInputChange}
        isSaving={isSaving}
        editingVideo={editingVideo}
      
    </div>
  );
}

export default Videos;