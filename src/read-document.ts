import { toast } from 'react-toast';

const parser = new DOMParser();

function buildDOM(source: string): Document {
  const doc = parser.parseFromString(source, 'text/html');
  return doc;
}

export async function readDocument(url: string): Promise<Document | null> {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return buildDOM(await response.text());
    }
    return null;
  } catch (e) {
    console.error(e);
    toast.error(String(e));
    throw e;
  }
}
