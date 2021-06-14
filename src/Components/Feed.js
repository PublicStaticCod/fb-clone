import React, { useEffect, useState } from 'react';
import './Feed.css';
import MessageSender from './MessageSender';
import Post from './Post';
import StoryReel from './StoryReel';
import axios from '../axios';
import Pusher from 'pusher-js';
import db from '../firebase';

// Pusher
const pusher = new Pusher('80b4e1e1fe4b7dfc56b7', {
	cluster: 'ap2',
});

const Feed = () => {
	const [profilePic, setProfilePic] = useState('');
	const [postsData, setPostsData] = useState([]);

	const syncFeed = () => {
		axios.get('/retrieve/posts').then((res) => {
			console.log(res.data);
			setPostsData(res.data);
		});
	};

	useEffect(() => {
		const channel = pusher.subscribe('posts');
		channel.bind('inserted', function (data) {
			syncFeed();
		});
	}, []);

	useEffect(() => {
		syncFeed();
	}, []);

	return (
		<div className='feed'>
			<StoryReel />
			<MessageSender />

			{postsData.map((entry) => (
				<Post
					profilePic={entry.avatar}
					message={entry.text}
					timestamp={entry.timestamp}
					imgName={entry.imgName}
					username={entry.user}
				/>
			))}
		</div>
	);
};

export default Feed;
