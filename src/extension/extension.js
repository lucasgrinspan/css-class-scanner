export const removeRecordingIndicator = () => {
  document.body.style.border = "none";
};

export const getAllClasses = () => {
  document.body.style.border = "5px solid red";

  const elementsWithClasses = Array.from(document.querySelectorAll("[class]"));
  const classes = elementsWithClasses.flatMap((node) => {
    return [...node.classList];
  });

  // remove duplicates
  const uniqueClasses = [...new Set(classes)];

  return uniqueClasses;
};
