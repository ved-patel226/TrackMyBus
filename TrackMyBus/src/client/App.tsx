import useSWR from "swr";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import NavigationView from "./components/molecules/NavigationView";
import Login from "./components/molecules/Login";
import LoginSuccess from "./components/molecules/LoginSuccess";
import Notification_ from "./components/Atoms/Notification";

import Secrets from "./lib/types/Misc";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function App() {
  const { data } = useSWR<Secrets>("/api/secrets", fetcher);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Router>
        <Notification_ />
        <Routes>
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route
            path="/login"
            element={
              <Login clientId="45407112104-d751s6nqlv8u23jvvmolthqensfok1va.apps.googleusercontent.com" />
            }
          />
          <Route path="/driver" element={<NavigationView API_KEY={data} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
