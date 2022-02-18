import { cli } from "./utils/cli.js";
import { getClassesFromStylesheet } from "./utils/stylesheet.js";
import { getClassesFromHtml } from "./utils/html.js";
import { getItems } from "./utils/file.js";
import { analyze } from "./report/index.js";

// Loads the CLI options
const options = cli;

const { stylesheet, url, sites: sitesPath } = options;

// Load the stylesheet, and get the classes from it
const classes = await getClassesFromStylesheet(stylesheet);

// Use the positional argument by default. If the --sites flag is provided, use that instead
let sites = [url];
if (sitesPath) {
  sites = getItems(sitesPath);
}

/* each key is the URL, each value is a map of classes and their frequency
 * { "example.com": {
 *     "container": 10,
 *     "col": 3,
 *     ...
 */
const htmlClasses = await getClassesFromHtml(sites, classes);

const reportRaw = analyze(classes, htmlClasses);
