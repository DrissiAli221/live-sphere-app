import axios from "axios";

// Base URL for images
export const baseImageW500 = "https://image.tmdb.org/t/p/w500";
export const baseImageOriginal = "https://image.tmdb.org/t/p/original";

// Base URL for making requests to the movie database
const baseURL = "https://api.themoviedb.org/3";
const apiKey = import.meta.env.VITE_APP_API_KEY;

//Trending All fetch
export const fetchTrending = async (timeWindow = "day") => {
  const { data } = await axios.get(
    `${baseURL}/trending/all/${timeWindow}?api_key=${apiKey}`
  );
  return data?.results;
};

// Fetch movie/tv shows details
export const fetchDetails = async (type, id) => {
  const response = await axios.get(
    `${baseURL}/${type}/${id}?api_key=${apiKey}`
  );
  return response.data; //get the data directly
};

// Fetch movie/tv shows credits
export const fetchCredits = async (type, id) => {
  const response = await axios.get(
    `${baseURL}/${type}/${id}/credits?api_key=${apiKey}`
  );
  return response.data;
};

// Discover movies
export const fetchDiscoverMovies = async () => {
  const { data } = await axios.get(
    `${baseURL}/discover/movie?api_key=${apiKey}`
  );
  return data.results;
};

// Movie/tv Images
export const fetchMovieImages = async (type, id) => {
  const { data } = await axios.get(
    `${baseURL}/${type}/${id}/images?api_key=${apiKey}`
  );
  return data;
};

// fetch recommendations
export const fetchRecommendations = async (type, id) => {
  const { data } = await axios.get(
    `${baseURL}/${type}/${id}/recommendations?api_key=${apiKey}`
  );
  return data.results;
};

// fetch trailers
export const fetchTrailers = async (type, id) => {
  const { data } = await axios.get(
    `${baseURL}/${type}/${id}/videos?api_key=${apiKey}`
  );
  return data.results;
};

//fetch trending movies
export const fetchTrendingMovies = async () => {
  const { data } = await axios.get(
    `${baseURL}/trending/movie/week?api_key=${apiKey}`
  );
  return data.results;
};

// fetch trending tv shows
export const fetchTrendingTVShows = async () => {
  const { data } = await axios.get(
    `${baseURL}/trending/tv/week?api_key=${apiKey}`
  );
  return data.results;
};

// fetch top rated
export const fetchTopRated = async (type) => {
  const { data } = await axios.get(
    `${baseURL}/${type}/top_rated?api_key=${apiKey}`
  );
  return data.results;
};

// fetch genres
export const fetchGenres = async (type) => {
  const { data } = await axios.get(
    `${baseURL}/genre/${type}/list?api_key=${apiKey}`
  );
  return data.genres;
};