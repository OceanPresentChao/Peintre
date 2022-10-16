import type { Point, ToolEventsObject } from './type'
export const PencilConfig = {
  delay: 10,
  maxWidth: 500,
  minWidth: 1,
}
export function usePencil(context: CanvasRenderingContext2D, revert?: () => void): ToolEventsObject {
  let isPainting = false
  const lastAxis = {
    x: 0,
    y: 0,
  }
  // 画点函数
  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    const startAngle = 0
    const endAngle = Math.PI * 2
    const anticlockwise = true
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
    ctx.closePath()
    ctx.fill()
  }

  // 划线函数
  const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number) => {
    // ctx.save()
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.closePath()
    // ctx.restore()
  }
  const onMousedown = (location: Point) => {
    isPainting = true
    lastAxis.x = location.x
    lastAxis.y = location.y
    if (isPainting)
      drawCircle(context, location.x, location.y, context.lineWidth / 2)
  }
  const onMousemove = (location: Point) => {
    if (isPainting) {
      // drawCircle(ctx, mx, my, ctx.lineWidth)
      drawLine(context, lastAxis.x, lastAxis.y, location.x, location.y, context.lineWidth)
      lastAxis.x = location.x
      lastAxis.y = location.y
    }
  }
  const onMouseup = (location: Point) => {
    lastAxis.x = location.x
    lastAxis.y = location.y
    isPainting = false
    context.closePath()
  }
  return {
    onMousedown: useThrottleFn(onMousedown, PencilConfig.delay),
    onMousemove: useThrottleFn(onMousemove, PencilConfig.delay),
    onMouseup,
    onTouchstart: useThrottleFn(onMousedown, PencilConfig.delay),
    onTouchmove: useThrottleFn(onMousemove, PencilConfig.delay),
    onTouchend: onMouseup,
  }
}
