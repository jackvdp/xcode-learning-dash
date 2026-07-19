import { useEffect, useState } from "react";
import XcodeInternalsDashboard from "../xcode-internals-dashboard.jsx";
import BuildProcessArticle from "../wwdc2018-415-article.jsx";

const getRoute = () => window.location.hash.replace(/^#/, "") || "/";

const TITLES = {
  "/": "import XcodeInternals",
  "/wwdc2018-415": "Behind the Scenes of the Xcode Build Process",
};

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.title = TITLES[route] || TITLES["/"];
    window.scrollTo(0, 0);
  }, [route]);

  return route === "/wwdc2018-415" ? <BuildProcessArticle /> : <XcodeInternalsDashboard />;
}
