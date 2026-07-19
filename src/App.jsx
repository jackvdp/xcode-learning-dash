import { useEffect, useState } from "react";
import XcodeInternalsDashboard from "../components/xcode-internals-dashboard.jsx";
import Article from "../components/article.jsx";
import Lab from "../components/lab.jsx";
import { ARTICLES } from "../articles/index.js";
import { LABS } from "../labs/index.js";

const getRoute = () => window.location.hash.replace(/^#/, "") || "/";

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const article = ARTICLES.find((a) => route === `/${a.id}`);
  const lab = LABS.find((l) => route === `/labs/${l.id}`);

  useEffect(() => {
    document.title = article ? article.title : lab ? lab.title : "import XcodeInternals";
    window.scrollTo(0, 0);
  }, [route]);

  if (article) return <Article article={article} />;
  if (lab) return <Lab lab={lab} />;
  return <XcodeInternalsDashboard />;
}
