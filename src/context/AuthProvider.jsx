import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/services/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Sign in with google function
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setError(null);
      return result.user;
    } catch (error) {
      setError(error.message);
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  }

  // Create account function
  async function createAccount(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUser(user);
      setError(null);
      return user;
    } catch (error) {
      setError(error.message);
      console.error("Create Account Error:", error);
      throw error;
    }
  }

  // Sign in function with email and password
  async function connectAccount(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUser(user);
      setError(null);
      return user;
    } catch (error) {
      setError(error.message);
      console.error("Sign In Error:", error);
      throw error;
    }
  }

  // Log out function
  async function logout() {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error("Logout Error:", error);
      throw error;
    }
  }

  // Listener for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        createAccount,
        connectAccount,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};