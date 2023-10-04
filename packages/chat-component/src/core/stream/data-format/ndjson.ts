export class NdJsonParserStream extends TransformStream<string, JSON> {
  constructor() {
    let controller: TransformStreamDefaultController<JSON>;
    super({
      start: (_controller) => {
        controller = _controller;
      },
      transform: (chunk) => {
        const jsonChunks = chunk.split('\n').filter(Boolean);
        for (const jsonChunk of jsonChunks) {
          controller.enqueue(JSON.parse(jsonChunk));
        }
      },
    });
  }
}
