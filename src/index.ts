/**
 * A comment about DummyClass
 * It's a great class
 */
export class DummyClass {
  value = true;

  hello() {
    return 'hello';
  }

  async test() {
    const something = await Promise.resolve({ text: 'file text' });
    return something.text;
  }
}
