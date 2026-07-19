// Article registry. To add an article: create articles/<id>.jsx exporting
// an article object, import it here, and add it to the list. The router
// serves each one at #/<id>.
import toolchainPrimer from "./toolchain-primer.jsx";
import wwdc2018415 from "./wwdc2018-415.jsx";

export const ARTICLES = [toolchainPrimer, wwdc2018415];
