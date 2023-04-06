import { loadedMap } from './loaded-map';
import { getItemPoint } from './get-item-point';
import { drawPoint } from './draw-point';

export function getItemAnchor(listItem: HTMLLIElement): HTMLAnchorElement | null {
  const itemAnchor = listItem.querySelector('a[id^=itemName][title][href^="/dp/"]') as HTMLAnchorElement | null;
  return itemAnchor;
}

export function getPricePoint(listItem: HTMLLIElement): HTMLSpanElement | null {
  const maybePricePoint = listItem.querySelector('span[id^=itemPrice] > span[aria-hidden]') as HTMLSpanElement | null;
  return maybePricePoint;
}

export function findDisplayPosition(listItem: HTMLLIElement): HTMLSpanElement | null {
  const maybePricePoint = listItem.querySelector('span[id^=itemPrice] > span[aria-hidden]') as HTMLSpanElement | null;
  return maybePricePoint;
}
