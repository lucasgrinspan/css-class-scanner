export const getAllClasses = () => {
  const elementsWithClasses = Array.from(document.querySelectorAll("[class]"));
  const classes = elementsWithClasses.flatMap((node) => {
    return [...node.classList];
  });

  // remove duplicates
  const uniqueClasses = [...new Set(classes)];

  return uniqueClasses;
};
