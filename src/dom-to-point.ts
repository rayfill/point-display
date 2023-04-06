function query(dom: Document, expression: string): string | null {
  let node = dom.querySelector(expression) as HTMLBaseElement | null;
  let maybePoint = node !== null ? node.innerText : null;
  if (maybePoint !== null) {
    return maybePoint;
  }
  return null;
}

export function DOMToPoint(dom: Document): string | null {

  // old kindle point
  let maybePoint = query(dom, 'tr.loyalty-points span.a-color-price.a-text-bold');
  if (maybePoint !== null) {
    return maybePoint;
  }

  // new kindle point
  maybePoint = query(dom, 'tr.ebooks-aip-points-label span.a-color-price.a-text-bold');
  if (maybePoint !== null) {
    return maybePoint;
  }

  // foreign books
  maybePoint = query(dom, 'span.a-color-base > span.a-color-price.a-text-normal');
  if (maybePoint !== null) {
    return maybePoint;
  }

  // foreign books part 2
  maybePoint = query(dom, 'div.a-section > div.a-row > div.a-column.a-span12.a-text-left.a-spacing-top-micro');
  if (maybePoint !== null) {
    return maybePoint;
  }

  // foreign books market place opened
  //document.querySelectorAll('div.a-row > div.a-row.a-spacing-micro > span.a-size-base.a-color-base')
  return maybePoint;
}
