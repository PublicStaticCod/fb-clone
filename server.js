// import
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import path from 'path';
import GridFsStorage from 'multer-gridfs-storage';
import multer from 'multer';
import bodyParser from 'body-parser';
import Grid from 'gridfs-stream';
import mongoPosts from './mongoPosts.js';

// Gride Mongo

Grid.mongo = mongoose.mongo;

// app config

const app = express();
const port = process.env.PORT || 9000;

// Pusher
const pusher = new Pusher({
	appId: '1087627',
	key: '80b4e1e1fe4b7dfc56b7',
	secret: '06151e8599a5fb97e172',
	cluster: 'ap2',
	useTLS: true,
});

// middlewares

// read wirte acess for json file
app.use(bodyParser.json());
app.use(cors());

// db config

const mongoURI =
	'mongodb+srv://admin:qE4Hc6Kr9qHtbH2I@cluster0.qllbb.mongodb.net/fbdb?retryWrites=true&w=majority';

// create a first connection for images
const conn = mongoose.createConnection(mongoURI, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// use the up storage
mongoose.connect(mongoURI, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
	console.log('DB CONNECTED');

	// watching db by pusher
	const changeStream = mongoose.connection.collection('posts').watch();

	changeStream.on('change', (change) => {
		// insert, Delete
		console.log(change);

		if (change.operationType === 'insert') {
			console.log('Triggring Pusher');
			pusher.trigger('posts', 'inserted', {
				change: change,
			});
		} else {
			console.log('Error triggering Puser');
		}
	});
});

let gfs;

conn.once('open', () => {
	console.log('DB Connected');

	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection('images');
});

const storage = new GridFsStorage({
	url: mongoURI,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			const filename = `image-${Date.now()}${path.extname(file.originalname)}`;

			const fileInfo = {
				filename: filename,
				bucketName: 'images',
			};

			resolve(fileInfo);
		});
	},
});

const upload = multer({ storage });

// api route

app.get('/', (req, res) =>
	res.status(200).send('HELLO BACKEND SERVER IS READY')
);

app.post('/upload/image', upload.single('file'), (req, res) => {
	res.status(201).send(req.file);
});

app.post('/upload/post', (req, res) => {
	const dbPost = req.body;

	mongoPosts.create(dbPost, (err, data) => {
		if (err) {
			res.status(500).send(err);
		} else {
			// successfully created
			res.status(201).send(data);
		}
	});
});

app.get('/retrieve/image/single', (req, res) => {
	gfs.files.findOne({ filename: req.query.name }, (err, file) => {
		if (err) {
			res.status(500).send(err);
		} else {
			if (!file || file.length === 0) {
				res.status(404).json({ err: 'file not found' });
			} else {
				const readstream = gfs.createReadStream(file.filename);
				readstream.pipe(res);
			}
		}
	});
});

// retrice all the post
app.get('/retrieve/posts', (req, res) => {
	// get ecerything from database
	mongoPosts.find((err, data) => {
		if (err) {
			res.status(500).send(err);
		} else {
			// sort everything from database in desending order
			data.sort((b, a) => {
				return a.timestamp - b.timestamp;
			});

			res.status(200).send(data);
		}
	});
});

// listen

app.listen(port, () => console.log(`listening on localhost: ${port}`));
