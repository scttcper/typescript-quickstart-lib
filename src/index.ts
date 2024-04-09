/**
 * A comment about DummyClass
 * It's a great class
 */
export class DummyClass {
  value = true;

  async load(): Promise<string> {
    const something = await Promise.resolve({ text: 'text' });
    return something.text;
  }
}

const x = [1, 2, 3, 4, 5];
const y = x.map(n => n * 2);
const is = x === y;
