import { initializeApp } from "firebase/app";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import * as firestoreCollections from "../infrastructure/theme/firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { getDatabase, push, set, ref as realtimeRef } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAPuKmbdLmC_2SHmKSDH-ttCCut2NCf1MA",

  authDomain: "the-apec-group.firebaseapp.com",

  projectId: "the-apec-group",

  storageBucket: "the-apec-group.appspot.com",

  messagingSenderId: "279711096475",

  appId: "1:279711096475:web:ab2837b62b65440efb303e",

  measurementId: "G-NW804K42PP",
};

// const firebaseConfig = {
//   apiKey: "AIzaSyDQpEVlbvscQUU7E3FehvPe1WEwNbluw8Q",
//   authDomain: "fir-db-project-798a3.firebaseapp.com",
//   databaseURL: "https://fir-db-project-798a3-default-rtdb.firebaseio.com",
//   projectId: "fir-db-project-798a3",
//   storageBucket: "fir-db-project-798a3.appspot.com",
//   messagingSenderId: "298867210644",
//   appId: "1:298867210644:web:418ac465a3624d2ffb7781",
// };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
// const database = getDatabase(app);

export function addUser(user, collection) {
  return setDoc(doc(db, collection, user.username), user);
}

export function getUser(id) {
  return getDoc(doc(db, firestoreCollections.USER_COLLECTION, id));
}

export function addDocument(object, collectionName) {
  return addDoc(collection(db, collectionName), object);
}

export const getAllDocuments = (collectionName, callback) => {
  const q = query(collection(db, collectionName));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const data = [];
    querySnapshot.forEach((doc) => {
      const mergedData = { ...doc.data(), ...{ folderId: doc.id } };
      data.push(mergedData);
    });
    if (callback) {
      callback(data);
    }
  });
  return unsubscribe;
};

export async function uploadImage(path, image) {
  const storageRef = ref(storage, `${path}`);
  const response = await fetch(image);
  const blob = await response.blob();
  return uploadBytesResumable(storageRef, blob);
}

export async function updateDocument(collectionName, docId, object) {
  return updateDoc(doc(db, collectionName, docId), object);
}
export async function updateArrays(collectionName, docId, contentType, url) {
  if (contentType == "image") {
    return updateDoc(doc(db, collectionName, docId), {
      images: arrayUnion(url),
    });
  } else if (contentType == "video") {
    return updateDoc(doc(db, collectionName, docId), {
      videos: arrayUnion(url),
    });
  }
}

export async function uploadDocument(path, documentUri) {
  const storageRef = ref(storage, `${path}`);
  const response = await fetch(documentUri);
  const blob = await response.blob();
  return uploadBytesResumable(storageRef, blob);
}

// export async function sendMessage(currentName, guestName, message) {
//   return set(
//     push(realtimeRef(database, `theApecGroup/${currentName}/${guestName}`)),
//     {
//       sender: currentName,
//       reciever: guestName,
//       message: message,
//     }
//   );
// }

// export async function recieveMessage(currentName, guestName, message) {
//   return set(
//     push(realtimeRef(database, `theApecGroup/${guestName}/${currentName}`)),
//     {
//       sender: currentName,
//       reciever: guestName,
//       message: message,
//     }
//   );
// }
