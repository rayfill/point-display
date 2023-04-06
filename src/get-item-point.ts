import { toast } from 'react-toast';
import { readDocument } from './read-document';
import { DOMToPoint } from './dom-to-point';

export async function getItemPoint(url: string): Promise<string | null> {
  try {
    const maybeDOM = await readDocument(url);
    if (maybeDOM === null) {
      return null;
    }
    const DOM: Document = maybeDOM;
    const point = DOMToPoint(DOM);
    return point;
  } catch (e) {
    toast.error(String(e));
    throw e;
  }
}
