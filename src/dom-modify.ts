import { Observable, Subject } from 'rxjs';

export function DOMModify(root: HTMLElement): Observable<HTMLElement> {

  const observable = new Observable<HTMLElement>((subscriber) => {
    const callback: MutationCallback = (mutations: MutationRecord[], _observer: MutationObserver): void => {

      mutations.forEach((mutation) => {
        const node = mutation.target;
        if (node instanceof HTMLElement) {
          subscriber.next(node);
        }
      });
    };
    const observer = new MutationObserver(callback);
    observer.observe(root, { subtree: true, childList: true, attributes: true, characterData: false, });
    subscriber.add(() => {
      console.log('call dom modify observable unsubscribe');
      observer.disconnect();
    });
  });
  return observable;
}
