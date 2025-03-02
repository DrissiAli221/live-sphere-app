import axios from "axios";

const baseURL = "https://api.themoviedb.org/3";
const apiKey = import.meta.env.VITE_APP_API_KEY;

//Trending All fetch
export const fetchTrending = async (timeWindow = 'day') => {
    const response = await axios.get(`${baseURL}/trending/all/${timeWindow}?api_key=${apiKey}`);
    return response;

};

