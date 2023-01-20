import { toast } from 'react-toast';
import { filter, fromEvent, interval, merge, mergeMap, Observable, Subject } from 'rxjs';
import { DOMModify } from './dom-modify';
import { readDocument } from './read-document';

const startPoint = merge(fromEvent(window, 'DOMContentLoaded'), fromEvent(document, 'load'));
const endPoint = fromEvent(window, 'unload');

function isTargetAnchor(elm: Node): elm is HTMLAnchorElement {
  return elm instanceof HTMLAnchorElement &&
    typeof elm.id === 'string' &&
    elm.id.startsWith('itemName') &&
    typeof elm.title === 'string' &&
    typeof elm.href === 'string' &&
    elm.href.startsWith('https://www.amazon.co.jp/dp/');
}

const loadedMap = new Map<string, HTMLLIElement>();

async function getItemPoint(url: string): Promise<string | null> {
  try {
    const maybeDOM = await readDocument(url);
    if (maybeDOM === null) {
      return null;
    }
    const DOM: Document = maybeDOM;
    const node = DOM.querySelector('tr.loyalty-points span.a-color-price.a-text-bold') as HTMLSpanElement | null;
    return node !== null ? node.innerText : null;
  } catch (e) {
    toast.error(String(e));
    throw e;
  }
}

function drawPoint(targetElement: HTMLSpanElement, maybePoint: string) {
  const div = document.createElement('div');

  if (div.querySelector('div[data-type=point]') === null) {
    div.innerText = maybePoint;
    div.dataset.type = 'point';
    targetElement.appendChild(div);
  }
}

const startPointSubscription = startPoint.subscribe(() => {
  console.log('startPoint');
  const modify = DOMModify(document.body);
  const initial = new Subject<HTMLLIElement>();
  const append = new Subject<HTMLLIElement>();
  const listItem = merge(initial, append);
  listItem.pipe(
    filter(listItem => {
      console.log(listItem.dataset.itemid);
      return !loadedMap.has(listItem.dataset.itemid!);
    })).subscribe(async listItem => {
    console.log('list item', listItem);
    try {
      loadedMap.set(listItem.dataset.itemid!, listItem);
      const itemAnchor = listItem.querySelector('a[id^=itemName][title][href^="/dp/"]') as HTMLAnchorElement | null;
      if (itemAnchor === null) {
        return;
      }
      const maybePoint = await getItemPoint(itemAnchor.href);
      const maybePricePoint = listItem.querySelector('span[id^=itemPrice] > span[aria-hidden]') as HTMLSpanElement | null;
      console.log(listItem.title, maybePoint, maybePricePoint);
      if (maybePoint === null || maybePricePoint === null) {
        return;
      }
      drawPoint(maybePricePoint, maybePoint);
      console.log('draw point');
    } catch (e) {
      console.error(e);
    }
  });

  const initialElements = Array.from(document.querySelectorAll('li[data-id]')) as Array<HTMLLIElement>;
  initialElements.forEach(elm => {
    console.log('initial element', elm);
    initial.next(elm);
  });

  modify.pipe(mergeMap(elm => {
    if (elm instanceof HTMLLIElement && typeof elm.dataset?.id === 'string') {
      return new Observable<HTMLLIElement>((subscriber) => {
        subscriber.next(elm);
        subscriber.complete();
      });
    }
    return new Observable<HTMLLIElement>((subscriber) => {
      const elements = Array.from(elm.querySelectorAll('li[data-id]')) as Array<HTMLLIElement>;
      elements.forEach((elm) => {
        subscriber.next(elm);
      });
      subscriber.complete();
    });
  })).subscribe(elm => {
    append.next(elm)
  });


  const endPointSubscription = endPoint.subscribe(() => {
    startPointSubscription.unsubscribe();
    endPointSubscription.unsubscribe();
  });
});
