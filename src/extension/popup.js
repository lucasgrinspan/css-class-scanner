const snapshotButton = document.getElementById("snapshot");
const exportButton = document.getElementById("export");
const clearButton = document.getElementById("clear");
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

const updateClassesFound = (classesFound) => {
  outputSection.innerHTML = `${classesFound} classes found`;
};

// initialize UI
const numClassesFound = await getFromBackground("numClassesFound");
const stylesheetUrl = await getFromBackground("stylesheetUrl");
stylesheetInput.value = stylesheetUrl || "";
updateClassesFound(numClassesFound);

const createDownload = (fileContent) => {
  const blob = new Blob([fileContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url,
    filename: "used_classes.csv",
  });
};

const handleExportClick = async () => {
  console.log("popup: requesting export data");

  // send a message to background script to get all of the data
  chrome.runtime.sendMessage({ action: "export" }, (response) => {
    console.log("popup: export data received");
    createDownload(response.result);
  });
};

const handleSnapshotClick = async () => {
  console.log("popup: snapshot button clicked");
  chrome.runtime.sendMessage({ action: "snapshot" });
};

const handleClearClick = async () => {
  console.log("popup: clear button clicked");
  chrome.runtime.sendMessage({ action: "clear" });
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
    case "numClassesFound":
      console.log("popup: new classes found:", message.numClassesFound);
      updateClassesFound(message.numClassesFound);
      break;
  }
});

snapshotButton.addEventListener("click", handleSnapshotClick);
exportButton.addEventListener("click", handleExportClick);
clearButton.addEventListener("click", handleClearClick);
stylesheetInput.addEventListener("blur", handleInputBlur);
