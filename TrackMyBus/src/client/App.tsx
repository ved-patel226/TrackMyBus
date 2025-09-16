import useSWR from "swr";
import NavigationView from "./components/molecules/NavigationView";
import Secrets from "./lib/types/Misc";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function App() {
  const { data } = useSWR<Secrets>("/api/secrets", fetcher);

  console.log(data?.GOOGLE_MAPS_API_KEY);

  if (!data) {
    return <div>Loading...</div>;
  }

  return <NavigationView API_KEY={data} />;
}

export default App;
