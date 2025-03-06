import axios from "axios";

// Base URL for images
export const baseImageW500 = 'https://image.tmdb.org/t/p/w500';
export const baseImageOriginal = 'https://image.tmdb.org/t/p/original';

// Base URL for making requests to the movie database
const baseURL = "https://api.themoviedb.org/3";
const apiKey = import.meta.env.VITE_APP_API_KEY;

//Trending All fetch
export const fetchTrending = async (timeWindow = 'day') => {
    const { data } = await axios.get(`${baseURL}/trending/all/${timeWindow}?api_key=${apiKey}`);
    return data?.results;

};

// Fetch movie/tv shows details
export const fetchDetails = async ( type , id ) => {
    const response = await axios.get(`${baseURL}/${type}/${id}?api_key=${apiKey}`);
    return response.data; //get the data directly
}