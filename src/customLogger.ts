export default function logMessage(message: string) {
  const body = document.querySelector('body');
  const paragraph = document.createElement('p');
  paragraph.textContent = message;
  body!.appendChild(paragraph);
}
