import fetch from "node-fetch";
import { parse } from "css";

// wow
const CLASS_REGEX =
  /\.-?(?:[_a-z]|[\240-\377]|(?:(:?\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))(?:[_a-z0-9-]|[\240-\377]|(?:(:?\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*/g;

/**
 * Utility function to remove duplicate values from array
 * @param {Array} array array to flatten
 * @returns {Array}
 */
const unique = (array) => {
  return [...new Set(array)];
};

/**
 * Returns an array of the top level rules defined in a stylesheet
 * @param {AST} ast AST of the stylesheet to get the root rules of
 * @returns {Array.<Rules>}
 */
const getRootRules = (ast) => {
  if (!ast.stylesheet) {
    return [];
  }
  return ast.stylesheet.rules.filter((node) => node.type === "rule");
};

/**
 * Returns an array of media rules defined in a stylesheet
 * @param {AST} ast AST of the stylesheet to get the media rules of
 * @returns {Array.<Rules>}
 */
const getMediaRules = (ast) => {
  if (!ast.stylesheet) {
    return [];
  }

  const mediaNodes = ast.stylesheet.rules.filter((node) => node.type === "media");
  return mediaNodes.flatMap((node) => {
    return node.rules || [];
  });
};

/**
 * Gets the selectors from a Rule object
 * @param {Array.<Rules>} rules
 * @returns {Array.<string>}
 */
const getSelectors = (rules) => {
  return rules.flatMap((rule) => rule.selectors || []);
};

/**
 * Extracts the class names from an array of selectors
 * @param {Array.<string>} selectors
 * @returns {Array.<string>} array of class names
 */
const getClasses = (selectors) => {
  return selectors.flatMap((selector) => {
    const matches = selector.matchAll(CLASS_REGEX);
    // the first match is the class name, and we also don't want the dot
    const classes = Array.from(matches, (x) => x[0].replace(".", ""));
    return classes;
  });
};

/**
 * Extracts all of the classes declared in a stylesheet
 * @param {string} url URL to analyze
 * @returns {Array.<string>} An array of all classes in the provided stylesheet
 */
export const getClassesFromStylesheet = async (url) => {
  const rawCss = await fetch(url).then((res) => res.text());
  const ast = parse(rawCss);

  const rules = [...getRootRules(ast), ...getMediaRules(ast)];
  const selectors = getSelectors(rules);
  const classes = getClasses(selectors);

  return unique(classes);
};
