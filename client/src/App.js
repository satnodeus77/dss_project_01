import { useState } from "react";
import axios from "axios";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import firebaseApp from "./firebaseConfig";

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

function App() {
  const [user, setUser] = useState(null);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const res = await axios.post("/api/auth/login", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      {user ? <h1>Welcome, {user.name}</h1> : <button onClick={login}>Login with Google</button>}
    </div>
  );
}

export default App;
