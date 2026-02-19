import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9bzB3P06DbpzQf3BsXjnzGLPAh4TL324",
  authDomain: "rapdxb-app.firebaseapp.com",
  projectId: "rapdxb-app",
  storageBucket: "rapdxb-app.firebasestorage.app",
  messagingSenderId: "459898012419",
  appId: "1:459898012419:android:1ec111bb418237597cdf36",
};

// Initialize Firebase App
let app: any = null;
let db: any = null;

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, "test"); // Using 'test' database
    console.log("Firebase initialized successfully");
    console.log("Firebase DB Name:", firebaseConfig.projectId);
    console.log("Firebase Database ID: test");
  }
  return { app, db };
};

// Get Current User's Document Data
export const getCurrentUserData = async (userEmail: string) => {
  try {
    if (!userEmail) {
      console.log("No user email provided");
      return null;
    }

    const { db } = initializeFirebase();

    // Try to get user by email as document ID
    const userDocRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const { profilePicture, ...userData } = userDoc.data();
      const userDataWithId = {
        id: userDoc.id,
        ...userData,
      };

      console.log("Firebase Collection Name: users");
      console.log("Current User Email:", userEmail);
      console.log("User Document Data:", userDataWithId);

      return userDataWithId;
    } else {
      // If not found by document ID, try querying by email field
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const { profilePicture, ...userData } = userDoc.data();
        const userDataWithId = {
          id: userDoc.id,
          ...userData,
        };

        console.log("Firebase Collection Name: users");
        console.log("Current User Email:", userEmail);
        console.log("User Document Data:", userDataWithId);

        return userDataWithId;
      } else {
        console.log("No user found with email:", userEmail);
        return null;
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

// Real-time listener for user data
export const listenToUserData = (
  userEmail: string,
  onUpdate: (userData: any) => void,
  onError?: (error: Error) => void,
) => {
  if (!userEmail) {
    console.log("No user email provided for listener");
    return () => {}; // Return empty unsubscribe function
  }

  const { db } = initializeFirebase();
  const userDocRef = doc(db, "users", userEmail);

  // Set up real-time listener
  const unsubscribe = onSnapshot(
    userDocRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const { profilePicture, ...userData } = docSnapshot.data();
        const userDataWithId = {
          id: docSnapshot.id,
          ...userData,
        };
        console.log("Real-time user data update:", userDataWithId);
        onUpdate(userDataWithId);
      } else {
        console.log("User document does not exist");
        onUpdate(null);
      }
    },
    (error) => {
      console.error("Error in real-time listener:", error);
      if (onError) {
        onError(error);
      }
    },
  );

  return unsubscribe; // Return unsubscribe function to stop listening
};

export { app, db };
