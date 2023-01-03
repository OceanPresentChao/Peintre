import type { Point, ToolEventsObject } from './type'
export const EraserConfig = {
  delay: 10,
}
export function useEraser(_?: () => void): ToolEventsObject {
  let isClearing = false
  const lastAxis = {
    x: 0,
    y: 0,
  }

  const clearCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.clearRect(x - radius, y - radius, radius * 2, radius * 2)
    ctx.restore()
  }
  const clearLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number) => {
    ctx.save()
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }
  const onMousedown = (context: CanvasRenderingContext2D, location: Point) => {
    isClearing = true
    lastAxis.x = location.x
    lastAxis.y = location.y
    if (isClearing)
      clearCircle(context !, location.x, location.y, context !.lineWidth / 2)
  }
  const onMousemove = (context: CanvasRenderingContext2D, location: Point) => {
    if (isClearing) {
      clearLine(context !, lastAxis.x, lastAxis.y, location.x, location.y, context !.lineWidth)
      lastAxis.x = location.x
      lastAxis.y = location.y
    }
  }
  const onMouseup = (context: CanvasRenderingContext2D, location: Point) => {
    lastAxis.x = location.x
    lastAxis.y = location.y
    isClearing = false
    context !.closePath()
  }
  return {
    onMousedown: useThrottleFn(onMousedown, EraserConfig.delay),
    onMousemove: useThrottleFn(onMousemove, EraserConfig.delay),
    onMouseup,
    onTouchstart: useThrottleFn(onMousedown, EraserConfig.delay),
    onTouchmove: useThrottleFn(onMousemove, EraserConfig.delay),
    onTouchend: onMouseup,
  }
}
