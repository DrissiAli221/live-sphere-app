// Custom hook to get the firestore database

import { db } from "@/services/firebase";
import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";

import toast from "react-hot-toast";

import { useCallback } from "react";

export const useFirestore = () => {
  const addDocument = async (collectionName, data) => {
    // Add a new document with a generated id.
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
  };

  // Add a document to the watchlist
  const addToWatchList = async (data, userId, dataId) => {
    try {
      if (await checkIfAlreadyInWatchList(userId, dataId)) {
        toast("Item already in watchlist", { type: "warning" });
        return;
      }
      // Database structure: userCollection -> userId -> watchlist -> movieId -> data
      await setDoc(
        doc(
          db,
          "userCollection",
          userId?.toString(),
          "watchlist",
          dataId?.toString()
        ),
        data
      );
      toast.success("Item Added to watchlist");
    } catch (error) {
      toast.error("Error Occured");
    }
  };

  // Check if a document exists in the watchlist
  const checkIfAlreadyInWatchList = async (userId, dataId) => {
    const docRef = doc(
      db,
      "userCollection",
      userId?.toString(),
      "watchlist",
      dataId?.toString()
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return true;
    }
    return false;
  };

  // Remove a document from the watchlist
  const removeFromWatchList = async (userId, dataId, type) => {
    try {
      const docRef = doc(
        db,
        "userCollection",
        userId?.toString(),
        "watchlist",
        dataId?.toString()
      );
      await deleteDoc(docRef);
      toast("Item removed from watchlist", { type: "warning" });
    } catch (error) {
      toast.error("Error Occured");
    }
  };

  // Get all documents from the watchlist
  const getWatchList = useCallback(async (userId) => {
    const querySnapshot = await getDocs(
      collection(db, "userCollection", userId?.toString(), "watchlist")
    );
    const watchlist = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));
    return watchlist;
  }, []);
  return {
    addDocument,
    addToWatchList,
    checkIfAlreadyInWatchList,
    removeFromWatchList,
    getWatchList,
  };
};
