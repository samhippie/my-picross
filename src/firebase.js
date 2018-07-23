
//inits firebase
//stolen from
//https://css-tricks.com/intro-firebase-react/

import firebase from 'firebase/app';
import firebaseui from 'firebaseui';
import 'firebase/firestore';

const config = {
	apiKey: "AIzaSyA0W3-8HywTKJefqQj3jIbsizmGjjR8-gU",
	authDomain: "my-picross.firebaseapp.com",
	databaseURL: "https://my-picross.firebaseio.com",
	projectId: "my-picross",
	storageBucket: "my-picross.appspot.com",
	messagingSenderId: "406487623200"
};
firebase.initializeApp(config);

const firestore = firebase.firestore();
//use new timestamp settings, need to disable a warning
firestore.settings({
		timestampsInSnapshots: true,
});

export {firebase as default, firebaseui, firestore};
