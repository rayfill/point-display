export function drawPoint(targetElement: HTMLSpanElement, maybePoint: string) {
  const div = document.createElement('div');

  if (div.querySelector('div[data-type=point]') === null) {
    div.innerText = maybePoint;
    div.dataset.type = 'point';
    targetElement.appendChild(div);
  }
}
