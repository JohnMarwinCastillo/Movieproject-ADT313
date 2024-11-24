import axios from 'axios';
import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './CastandCrew.css';

const CastAndCrew = () => {
  const [query, setQuery] = useState('');
  const [searchedPersonList, setSearchedPersonList] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(undefined);
  const [addedCast, setAddedCast] = useState([]);
  const { movieId } = useParams();
  const userId = localStorage.getItem('userId'); // Assuming the user ID is stored in localStorage
  

  // Search for people
  const handleSearch = useCallback(() => {
    axios({
      method: 'get',
      url: `https://api.themoviedb.org/3/search/person?query=${query}&include_adult=false&language=en-US&page=1`,
      headers: {
        accept: 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MGY0ZjFlMmNhODQ1ZjA3NWY5MmI5ZDRlMGY3ZTEwYiIsIm5iZiI6MTcyOTkyNjY3NC40NzIwOTksInN1YiI6IjY3MTM3ODRmNjUwMjQ4YjlkYjYxZTgxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RRJNLOg8pmgYoomiCWKtwkw74T3ZtAs7ZScqxo1bzWg',
      },
    })
      .then((response) => {
        setSearchedPersonList(response.data.results);
        console.log(response.data.results);
      })
      .catch((error) => {
        console.error('Error fetching person data:', error);
      });
  }, [query]);

  // Select a person from search results
  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
  };

  // Add selected person as cast member
  const handleAddCast = () => {
    if (!selectedPerson) {
      alert('Please select a person to add as cast.');
      return;
    }

    // Check if the person is already added to avoid duplicates
    const personExists = addedCast.some((cast) => cast.id === selectedPerson.id);
    if (personExists) {
      alert('This person is already added to the cast.');
      return;
    }

    setAddedCast((prevCast) => [
      ...prevCast,
      {
        id: selectedPerson.id,
        name: selectedPerson.name,
        url: selectedPerson.profile_path
          ? `https://image.tmdb.org/t/p/original/${selectedPerson.profile_path}`
          : '', // Use a default image if no profile path is available
        characterName: '', // You can later allow the user to enter character name
        dateCreated: new Date().toISOString(),
        dateUpdated: new Date().toISOString(),
      },
    ]);
    setSelectedPerson(undefined); // Reset selected person
  };

  // Handle save operation (send added cast to the backend)
  const handleSaveCast = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (addedCast.length === 0) {
      alert('No cast members added.');
      return;
    }

    // Prepare the data for the cast members
    const castData = addedCast.map((person) => ({
      movieId,
      userId,
      name: person.name,  
      url: person.url,
      characterName: person.characterName,
      dateCreated: person.dateCreated,
      dateUpdated: person.dateUpdated,
    }));

    try {
      const response = await axios({
        method: 'post',
        url: 'casts', // Your backend API to save cast
        data: { cast: castData },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log('Cast added:', response);
      alert('Cast successfully added!');
    } catch (error) {
      console.error('Error adding cast:', error);
      alert('Error adding cast.');
    }
  };

  return (
    <div className='cast-and-crew-container'>
      <h1>Cast & Crew</h1>

      {/* Search for a person */}
      <div className='search-container'>
        Search Person:
        <input
          type='text'
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type='button' onClick={handleSearch}>
          Search
        </button>
        <div className='searched-person'>
          {searchedPersonList.map((person) => (
            <p key={person.id} onClick={() => handleSelectPerson(person)}>
              {person.name}
            </p>
          ))}
        </div>
      </div>
      <hr />

      {/* Display selected person */}
      {selectedPerson && (
        <div className='person-details'>
          <img
            className='person-image'
            src={`https://image.tmdb.org/t/p/original/${selectedPerson.profile_path}`}
            alt={selectedPerson.name}
          />
          <div className='person-info'>
            <h3>{selectedPerson.name}</h3>
            <p>Known for: {selectedPerson.known_for_department}</p>
            <p>Biography: {selectedPerson.biography || 'No biography available.'}</p>
          </div>
          <button type='button' onClick={handleAddCast}>
            Add to Cast
          </button>
        </div>
      )}

      {/* Display added cast members */}
      <div className='added-cast'>
        <h2>Added Cast:</h2>
        <ul>
          {addedCast.map((cast) => (
            <li key={cast.id}>
              <img
                className='cast-image'
                src={cast.url}
                alt={cast.name}
                width={50}
              />
              {cast.name} ({cast.characterName || 'Character name not provided'})
            </li>
          ))}
        </ul>
      </div>

      {/* Save Cast */}
      {addedCast.length > 0 && (
        <button type='button' onClick={handleSaveCast}>
          Save Cast
        </button>
      )}
    </div>
  );
};

export default CastAndCrew;
