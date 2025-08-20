import React, { useEffect, useState } from "react";
import Home from "./pages/home";
import Navbar from "./components/Navbar";
import { supabase } from "./supabaseClient";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      <Navbar user={user} setUser={setUser} />
      
      <Home />
    </div>
  );
}

export default App;
