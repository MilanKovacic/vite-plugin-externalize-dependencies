export const logMessage = (message: string) => {
  const body = document.querySelector("body");
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  body!.append(paragraph);
};
