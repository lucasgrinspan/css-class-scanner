import { readFileSync } from "fs";

/**
 * Reads a file and returns an array of its content, separated by newlines
 * @param {string} filePath
 * @returns {Array.<string>} Array of file paths
 */
export const getItems = (filePath) => {
  const urls = readFileSync(filePath, { encoding: "utf8" });
  return urls.split("\n").filter((url) => url);
};
