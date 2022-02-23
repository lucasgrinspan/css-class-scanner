import fs from "fs";

/**
 * Generates CSV files for used/unused classes
 * @param {Array.<string>} referenceClasses Classes from the stylesheet
 * @param {Array.<string>} htmlClasses Classes from the HTML
 */
export const analyze = (referenceClasses, htmlClasses) => {
  const unusedClasses = getUnusedClasses(referenceClasses, htmlClasses);

  generateUsedCsv(htmlClasses);
  generateUnusedCsv(unusedClasses);
};

/**
 * Gets all of the classes in the stylesheet that wasn't found in the HTML
 * @param {Array.<string>} referenceClasses Classes from the stylesheet
 * @param {Array.<string>} htmlClasses Classes from the HTML
 * @returns {Array.<string>} Unused classes
 */
const getUnusedClasses = (referenceClasses, usedClassesMap) => {
  const usedClasses = [...usedClassesMap.keys()];
  return referenceClasses.filter((classString) => !usedClasses.includes(classString));
};

/**
 * Generates a CSV where each line is a class that wasn't used
 * @param {Array.<string>} unusedClasses
 */
const generateUnusedCsv = (unusedClasses) => {
  fs.writeFileSync("classes_unused.csv", unusedClasses.join("\n"));
  console.log("✅ generated classes_unused.csv");
};

/**
 * Generates a CSV in the class,frequency format
 * @param {Map.<string, number>} htmlClasses Classes found in the HTML
 */
const generateUsedCsv = (htmlClasses) => {
  let csvString = "";
  htmlClasses.forEach((frequency, className) => {
    csvString += `${className},${frequency}\n`;
  });

  fs.writeFileSync("classes_used.csv", csvString);
  console.log("✅ generated classes_used.csv");
};
