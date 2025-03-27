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
import { toaster } from "@/components/ui/toaster";
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
        toaster.create({
          title: "Already in watchlist",
          description: `This ${
            data.type === "movie" ? "Movie" : "Show"
          } is already in your watchlist`,
          variant: "destructive",
          type: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      // Database structure: userCollection -> userId -> watchlist -> movieId -> data
      await setDoc(
        doc(db, "userCollection", userId?.toString(), "watchlist", dataId?.toString()),
        data
      );
      toaster.create({
        title: "Success",
        description: "Added to watchlist",
        variant: "success",
        duration: 3000,
        type: "success",
        isClosable: true,
      });
    } catch (error) {
      toaster.create({
        title: "Error Occured",
        description: "Failed to add to watchlist",
        variant: "destructive",
        duration: 3000,
        type: "error",
        isClosable: true,
      });
    }
  };

  // Check if a document exists in the watchlist
  const checkIfAlreadyInWatchList = async (userId, dataId) => {
    const docRef = doc(db, "userCollection", userId?.toString(), "watchlist", dataId?.toString());
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
      toaster.create({
        title: "Removed from watchlist",
        description: `The ${
          type === "movie" ? "Movie" : "Show"
        } has been removed from your watchlist`,
        variant: "success",
        duration: 3000,
        type: "success",
      });
    } catch (error) {
      toaster.create({
        title: "Error Occured",
        description: "Failed to remove from watchlist",
        variant: "destructive",
        duration: 3000,
        type: "error",
      });
    }
  };

  // Get all documents from the watchlist
  const getWatchList = useCallback(async (userId) => {
      const querySnapshot = await getDocs(collection(db, "userCollection", userId?.toString(), "watchlist"));
      const watchlist = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
      }));
      return watchlist;
  }, [])
  return {
    addDocument,
    addToWatchList,
    checkIfAlreadyInWatchList,
    removeFromWatchList,
    getWatchList,
  };
};
