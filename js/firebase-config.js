const firebaseConfig = {
  apiKey: "AIzaSyDTS4xy35X7kBxJFMZUpWCLeG2cHv-o9Wc",
  authDomain: "super-mall-app-614a9.firebaseapp.com",
  projectId: "super-mall-app-614a9",
  storageBucket: "super-mall-app-614a9.firebasestorage.app",
  messagingSenderId: "1073378204941",
  appId: "1:1073378204941:web:4751d39b74789ddf946444",
  measurementId: "G-M9HK3V48MK"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
