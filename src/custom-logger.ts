// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jsx from "react/jsx-dev-runtime";

// eslint-disable-next-line no-console
console.log("jsx", jsx);

export const logMessage = (message: string) => {
  const body = document.querySelector("body");
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  body!.append(paragraph);
};
