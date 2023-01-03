export interface ToolEventsObject {
  onMousedown?: (context: CanvasRenderingContext2D, location: Point) => any
  onMousemove?: (context: CanvasRenderingContext2D, location: Point) => any
  onMouseup?: (context: CanvasRenderingContext2D, location: Point) => any
  onMouseleave?: (context: CanvasRenderingContext2D, location: Point) => any
  onTouchstart?: (context: CanvasRenderingContext2D, location: Point) => any
  onTouchmove?: (context: CanvasRenderingContext2D, location: Point) => any
  onTouchend?: (context: CanvasRenderingContext2D, location: Point) => any
  [propName: string]: any
}

export interface Point {
  x: number
  y: number
}

export interface Layer extends Object {
  id: string
  name: string
  canvas: HTMLCanvasElement | null
  context: CanvasRenderingContext2D | null
  imageStack: Array<ImageData>
}
