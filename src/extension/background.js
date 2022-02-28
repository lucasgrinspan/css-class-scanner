import { getClassesFromStylesheet } from "../utils/stylesheet.js";
import { removeRecordingIndicator, getAllClasses } from "./extension.js";
import Store from "./store.js";

// Working storage for the background
const store = new Store({
  // the number of classes found so far
  numClassesFound: 0,
  // the URL of the external stylesheet
  stylesheetUrl: "",
  // classes extracted from the stylesheet
  referenceClasses: [],
});

// key is class and value is frequency
const gatheredClasses = new Map();

// stores the result in working memory
const updateClasses = ([injection]) => {
  injection.result.forEach((className) => {
    // the class name should only be collected if it's from the stylesheet
    if (!store.get("referenceClasses").includes(className)) {
      return;
    }

    const frequency = gatheredClasses.get(className);

    if (frequency) {
      gatheredClasses.set(className, frequency + 1);
    } else {
      gatheredClasses.set(className, 1);
    }
  });

  console.log(`background: snapshot complete, ${injection.result.length} classes found`);
  store.set("numClassesFound", gatheredClasses.size);
};

const getCurrentTab = async () => {
  const currentTab = await chrome.tabs.query({ active: true, currentWindow: true });
  return currentTab[0];
};

// injects a script into the current tab
const takeSnapshot = async () => {
  console.log("background: taking a snapshot");
  chrome.scripting.executeScript(
    {
      target: { tabId: (await getCurrentTab()).id },
      func: getAllClasses,
    },
    updateClasses
  );
};

const getClassNames = async (url) => {
  const classes = await getClassesFromStylesheet(url);
  store.set("referenceClasses", classes, { broadcast: false });
  console.log(`background: stylesheet loaded, ${classes.length} classes found`);
};

const getResultsAsCsv = () => {
  let csvContent = "";
  gatheredClasses.forEach((frequency, className) => {
    csvContent += `${className},${frequency}\n`;
  });

  return csvContent;
};

// handles an action request from the UI
const handleAction = (action, actionData, sendResponse) => {
  console.log("background: action received:", action);
  switch (action) {
    case "snapshot":
      takeSnapshot();
      break;
    case "url":
      store.set("stylesheetUrl", actionData);
      getClassNames(actionData);
      break;
    case "clear":
      store.set("numClassesFound", 0);
      gatheredClasses.clear();
      break;
    case "export":
      sendResponse({ result: getResultsAsCsv() });
      store.set("numClassesFound", 0);
      break;
  }
};

// handles a data request from the UI
const handleDataRequest = (request, sendResponse) => {
  const data = store.get(request);
  sendResponse({ data });
};

// handle requests for data from the UI
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  const { request, action, actionData } = message;

  if (request) {
    handleDataRequest(request, sendResponse);
  } else if (action) {
    handleAction(action, actionData, sendResponse);
  }

  return true;
});
