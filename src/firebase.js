import firebase from 'firebase';

const firebaseConfig = {
	apiKey: 'AIzaSyB_Y7wiZ6tUKTi3Wr1m40rqM42WedDlleg',
	authDomain: 'fb-mern-c2dc1.firebaseapp.com',
	databaseURL: 'https://fb-mern-c2dc1.firebaseio.com',
	projectId: 'fb-mern-c2dc1',
	storageBucket: 'fb-mern-c2dc1.appspot.com',
	messagingSenderId: '266054326794',
	appId: '1:266054326794:web:00c48d4606431e5074ddf3',
	measurementId: 'G-29PVXGH59T',
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.firestore();

export { auth, provider };
export default db;
