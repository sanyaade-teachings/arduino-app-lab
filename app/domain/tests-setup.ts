class MockWorker extends EventTarget {
  url: string;
  constructor(stringUrl: string) {
    super();
    this.url = stringUrl;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage(_msg: any): void {}
}

globalThis.Worker = MockWorker as any;

vi.stubGlobal('Worker', Worker);
