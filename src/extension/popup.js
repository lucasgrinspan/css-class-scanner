const recordingButton = document.getElementById("start-recording");
const exportButton = document.getElementById("export");
const cancelButton = document.getElementById("cancel");
const outputSection = document.getElementById("output");
const stylesheetInput = document.getElementById("stylesheet-link");

/**
 * Sends a request for data from background script. Lets me omit
 * "storage" from the extension permissions
 * @param {string} key The data to request from the background script
 * @returns Returns the data from the background as a promise
 */
const getFromBackground = async (key) => {
  return new Promise((resolve) => {
    console.log("popup: requesting data:", key);
    chrome.runtime.sendMessage({ request: key }, (response) => {
      console.log("popup: data received", response.data);
      resolve(response.data);
    });
  });
};

const getUpdatedButtonText = (recording) => {
  return recording ? "Stop Recording" : "Start Recording";
};
const getUpdatedClassesText = (classesFound) => {
  return classesFound ? `${classesFound} classes found` : "not recording";
};
// subsriber function to update recording state
const updateRecordState = (recording) => {
  recordingButton.innerHTML = getUpdatedButtonText(recording);
};
// subscriber function to update classes found
const updateClassesFound = (classesFound) => {
  outputSection.innerHTML = getUpdatedClassesText(classesFound);
};

// initialize UI
const isRecording = await getFromBackground("isRecording");
const numClassesFound = await getFromBackground("numClassesFound");
const stylesheetUrl = await getFromBackground("stylesheetUrl");
stylesheetInput.value = stylesheetUrl;
updateRecordState(isRecording);
updateClassesFound(numClassesFound);

const createDownload = (fileContent) => {
  const blob = new Blob([fileContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url,
    filename: "used_classes.csv",
  });
  gatheredClasses.clear();
};

const handleExportClick = async () => {
  if (!isRecording) {
    return;
  }

  console.log("popup: requesting export data");

  // send a message to background script to get all of the data
  chrome.runtime.sendMessage({ action: "export" }, (response) => {
    console.log("popup: export data received");
    createDownload(response.results);
  });
};

const handleRecordClick = async () => {
  console.log("popup: record button clicked");
  chrome.runtime.sendMessage({ action: "record" });
};

const handleCancelClick = async () => {
  console.log("popup: cancel button clicked");
  chrome.runtime.sendMessage({ action: "cancel" });
};

const handleInputBlur = async () => {
  console.log("popup: stylesheet URL provided");
  const { value } = stylesheetInput;
  if (value) {
    chrome.runtime.sendMessage({ action: "url", actionData: value });
  }
};

// handle data stream from background for data binding
chrome.runtime.onMessage.addListener((message) => {
  console.log("popup: message received");
  const { updatedKey } = message;
  switch (updatedKey) {
    case "isRecording":
      console.log("popup: new recording state:", message.isRecording);
      updateRecordState(message.isRecording);
      break;
    case "numClassesFound":
      console.log("popup: new classes found:", message.numClassesFound);
      updateClassesFound(message.numClassesFound);
      break;
  }
});

recordingButton.addEventListener("click", handleRecordClick);
exportButton.addEventListener("click", handleExportClick);
cancelButton.addEventListener("click", handleCancelClick);
stylesheetInput.addEventListener("blur", handleInputBlur);
