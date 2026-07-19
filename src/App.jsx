import { useEffect, useState } from "react";
import XcodeInternalsDashboard from "../xcode-internals-dashboard.jsx";
import Article from "../article.jsx";
import { ARTICLES } from "../articles/index.js";

const getRoute = () => window.location.hash.replace(/^#/, "") || "/";

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const article = ARTICLES.find((a) => route === `/${a.id}`);

  useEffect(() => {
    document.title = article ? article.title : "import XcodeInternals";
    window.scrollTo(0, 0);
  }, [route]);

  return article ? <Article article={article} /> : <XcodeInternalsDashboard />;
}
