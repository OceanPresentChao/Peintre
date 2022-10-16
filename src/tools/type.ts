export interface ToolEventsObject {
  onMousedown?: (location: Point) => any
  onMousemove?: (location: Point) => any
  onMouseup?: (location: Point) => any
  onMouseleave?: (location: Point) => any
  onTouchstart?: (location: Point) => any
  onTouchmove?: (location: Point) => any
  onTouchend?: (location: Point) => any
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
