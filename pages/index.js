import { useEffect, useState } from "react";
import { auth, provider, signInWithPopup } from "../lib/firebase";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) saveUserToDB(currentUser);
    });
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      saveUserToDB(result.user);
    } catch (error) {
      console.error("Login Error", error);
    }
  };

  const logout = () => {
    auth.signOut();
    setUser(null);
  };

  const saveUserToDB = async (user) => {
    try {
      await fetch("/api/saveUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
        }),
      });
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      {user ? (
        <>
          <h1>Welcome, {user.displayName}</h1>
          <p>{user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={loginWithGoogle}>Sign in with Google</button>
      )}
    </div>
  );
}
