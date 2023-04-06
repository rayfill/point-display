import { filter, fromEvent, merge, mergeMap, Observable, Subject } from 'rxjs';
import { DOMModify } from './dom-modify';
import { loadedMap } from './loaded-map';
import { getItemPoint } from './get-item-point';
import { drawPoint } from './draw-point';
import { findDisplayPosition, getItemAnchor, getPricePoint } from './find-display-position';
import { Logger } from 'tslog';

const logger = new Logger({ name: 'main' });
const startPoint = merge(fromEvent(window, 'DOMContentLoaded'), fromEvent(document, 'load'));
const endPoint = fromEvent(window, 'unload');

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

      loadedMap.set(listItem.dataset.itemid!, listItem);
      console.log(listItem);
      const itemAnchor = getItemAnchor(listItem);
      if (itemAnchor === null) {
        logger.error(`itemAnchor not found`);
        return;
      }
      const maybePricePlace = findDisplayPosition(listItem);
      if (maybePricePlace === null) {
        logger.error(`price place not found`);
        return;
      }
      const maybePoint = await getItemPoint(itemAnchor.href);
      if (maybePoint === null) {
        logger.error(`itemPoint not found`);
        return;
      }

      drawPoint(maybePricePlace, maybePoint);
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
