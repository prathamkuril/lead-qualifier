declare module 'chart.js/auto' {
  export default class Chart {
    constructor(ctx: CanvasRenderingContext2D, config: any);
    destroy(): void;
  }
}
