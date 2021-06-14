import axios from 'axios';

const instance = axios.create({
	// baseURL: 'http://localhost:9000/',
	baseURL: 'https://facebook-mern-backend.herokuapp.com',
});

export default instance;
