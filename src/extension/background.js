// import { get/ClassesFromStylesheet } from "../utils/stylesheet.js";
import { removeRecordingIndicator, getAllClasses } from "./extension.js";
import Store from "./store.js";

// Working storage for the background
const store = new Store({
  // true if the extension is currently scraping sites for CSS classes
  isRecording: false,
  // the number of classes found so far
  numClassesFound: 0,
  // stylesheet URL for comparison
  stylesheetUrl: "",
});

// key is class and value is frequency
const gatheredClasses = new Map();

// stores the result in working memory
const updateClasses = ([injection]) => {
  injection.result.forEach((className) => {
    const frequency = gatheredClasses.get(className);

    if (frequency) {
      gatheredClasses.set(className, frequency + 1);
    } else {
      gatheredClasses.set(className, 1);
    }
  });

  store.set("numClassesFound", gatheredClasses.size);
};

const getCurrentTab = async () => {
  const currentTab = await chrome.tabs.query({ active: true, currentWindow: true });
  return currentTab[0];
};

// injects a script into the current tab
const startRecording = async () => {
  console.log("background: starting to record");
  chrome.scripting.executeScript(
    {
      target: { tabId: (await getCurrentTab()).id },
      func: getAllClasses,
    },
    updateClasses
  );
};

const stopRecording = async () => {
  console.log("background: recording stopped");
  chrome.scripting.executeScript({
    target: { tabId: (await getCurrentTab()).id },
    func: removeRecordingIndicator,
  });
};

const getClassNames = async (url) => {
  // const classes = getClassesFromStylesheet(url);
  // console.log(classes);
};

const getResultsAsCsv = () => {
  let csvContent = "";
  gatheredClasses.forEach((frequency, className) => {
    csvContent += `${className},${frequency}\n`;
  });

  return csvContent;
};

// listen for recording status changes
store.subscribe("isRecording", (isRecording) => {
  console.log("background: store data changed: isRecording:", isRecording);
  if (isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
});

// listen for stylesheet URL being defined
store.subscribe("stylesheetUrl", (url) => {
  if (!url) {
    return;
  }
  console.log("background: store data changed: stylesheetUrl:", url);
  getClassNames(url);
});

// handles an action request from the UI
const handleAction = (action, actionData, sendResponse) => {
  console.log("background: action received:", action);
  switch (action) {
    case "record":
      store.set("isRecording", !store.get("isRecording"));
      break;
    case "url":
      store.set("stylesheetUrl", actionData);
      break;
    case "cancel":
      store.set("isRecording", false);
      store.set("numClassesFound", 0);
      gatheredClasses.clear();
      break;
    case "export":
      sendResponse({ result: getResultsAsCsv() });
      store.set("isRecording", false);
      store.set("numClassesFound", 0);
      break;
  }
};

// handles a data request from the UI
const handleDataRequest = (request, sendResponse) => {
  const data = store.get(request);
  sendResponse({ data });
};

// when a tab loads, should keep recording classes
chrome.tabs.onUpdated.addListener((_, { status }) => {
  if (status === "complete" && store.get("isRecording")) {
    startRecording();
  }
});

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
