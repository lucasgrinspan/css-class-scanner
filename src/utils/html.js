import fetch from "node-fetch";
import ProgressBar from "progress";

// Matches whatever is in the class string
const HTML_CLASS_REGEX = /class="(.*?)"/g;

/**
 * Gets an array of all classes from an HTML file
 * @param {string} html HTML content as a string
 * @param {Array.<string>} classes Will only add classes that are in this array
 * @returns {Array.<string>} classes found in the HTML content
 */
export const parseClassesFromHtml = (html, referenceClasses) => {
  const matches = html.matchAll(HTML_CLASS_REGEX);

  // there can be multiple classes within a class attribute
  const classes = Array.from(matches, (x) => x[1])
    .flatMap((classString) => classString.split(" "))
    .filter((classString) => referenceClasses.includes(classString));

  return classes;
};

/**
 * Creates an object where each key is the item and the value is the relative frequency
 * @param {Array.<string>} classes
 * @returns {Map.<string, number>}
 */
const getRelativeFrequency = (classes) => {
  const classFrequencies = new Map();

  classes.forEach((classString) => {
    const frequency = classFrequencies.get(classString);

    if (frequency) {
      classFrequencies.set(classString, frequency + 1);
    } else {
      classFrequencies.set(classString, 1);
    }
  });

  return classFrequencies;
};

/**
 * Generates an object where each key is the URL and each value is the classes
 * used by that site
 * @param {Array.<string>} sites URLs to analyze
 * @param {Array.<string>} classes Classes used to filter classes from HTML
 * @returns Map of class frequencies
 */
export const getClassesFromHtml = async (sites, referenceClasses) => {
  // show a cool progress bar 😎
  const bar = new ProgressBar("Fetching sites [:bar] :current/:total", sites.length);

  // i'll refactor this later
  const requests = sites.flatMap((site) =>
    fetch(site, { redirect: "follow", follow: 20 })
      .then((res) => res.text())
      .then((html) => {
        bar.tick();
        return parseClassesFromHtml(html, referenceClasses);
      })
      .catch(() => {
        bar.tick();
        return [];
      })
  );

  const htmlClasses = (await Promise.all(requests)).flatMap((classes) => classes);

  bar.terminate();
  console.log("Parsing sites...");

  return getRelativeFrequency(htmlClasses);
};
