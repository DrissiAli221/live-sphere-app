import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/services/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // --- Error Mapping Helper ---
  const mapAuthCodeToMessage = (authCode) => {
    switch (authCode) {
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "This email address is already registered.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled.";
      case "auth/weak-password":
        return "Password is too weak. Please choose a stronger password.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup closed before completion.";
      case "auth/cancelled-popup-request":
        return "Only one sign-in popup allowed at a time.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  // Sign in with google function
  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setError(null);
      return result.user;
    } catch (error) {
      setError(mapAuthCodeToMessage(error.code));
      console.error("Google Sign-In Error:", error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Create account function
  async function createAccount(email, password, username) {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Update username in Firebase Auth
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      setUser(user);
      setError(null);
      return user;
    } catch (error) {
      setError(mapAuthCodeToMessage(error.code));
      console.error("Create Account Error:", error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Sign in function with email and password
  async function connectAccount(email, password) {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      setUser(user);
      setError(null);
      return user;
    } catch (error) {
      setError(mapAuthCodeToMessage(error.code));
      console.error("Sign In Error:", error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Password Reset Function
  async function resetPassword(email) {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("Password Reset Error:", error.code, error.message);
      const friendlyError = mapAuthCodeToMessage(error.code);
      setError(friendlyError);
      throw new Error(friendlyError);
    } finally {
      setLoading(false);
    }
  }

  // Log out function
  async function logout() {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (error) {
      setError(mapAuthCodeToMessage(error.code));
      console.error("Logout Error:", error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
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
        authError: error,
        createAccount,
        connectAccount,
        signInWithGoogle,
        logout,
        resetPassword,
        mapAuthCodeToMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
