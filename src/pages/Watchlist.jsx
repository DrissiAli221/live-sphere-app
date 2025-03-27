import { useState, useEffect } from "react"; 
import { useAuth } from "@/context/AuthProvider";
import { useFirestore } from "@/services/firestore";

function Watchlist() {
  const { user } = useAuth();
  const { getWatchList } = useFirestore();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the watchlist from the database
  useEffect(() => {
    if (!user) return;

    if(user?.uid){
        getWatchList(user?.uid)
        .then((res) => setWatchlist(res))
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    }
    // use useCallback when calling a function inside useEffect to prevent re-rendering
  }, [user, getWatchList])
  
  console.log(watchlist)
  return (
    <div>
      
    </div>
  )
}

export default Watchlist
