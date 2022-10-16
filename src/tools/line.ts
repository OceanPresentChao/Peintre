import type { Point, ToolEventsObject } from './type'
export const LineConfig = {
  delay: 10,
}
export function useLine(context: CanvasRenderingContext2D, revert?: () => void): ToolEventsObject {
  let isPainting = false
  const startAxis = {
    x: 0,
    y: 0,
  }
  const endAxis = {
    x: 0,
    y: 0,
  }

  const onMousedown = (location: Point) => {
    startAxis.x = location.x
    startAxis.y = location.y
    isPainting = true
  }
  const onMousemove = (location: Point) => {
    if (!revert)
      return
    const ctx = context
    endAxis.x = location.x
    endAxis.y = location.y
    if (isPainting) {
      revert()
      ctx.beginPath()
      context.moveTo(startAxis.x, startAxis.y)
      ctx.lineTo(endAxis.x, endAxis.y)
      ctx.closePath()
      ctx.stroke()
    }
  }
  const onMouseup = (location: Point) => {
    isPainting = false
    endAxis.x = location.x
    endAxis.y = location.y
    context.closePath()
  }
  return {
    onMousedown: useThrottleFn(onMousedown, LineConfig.delay),
    onMousemove: useThrottleFn(onMousemove, LineConfig.delay),
    onMouseup,
    onTouchstart: useThrottleFn(onMousedown, LineConfig.delay),
    onTouchmove: useThrottleFn(onMousemove, LineConfig.delay),
    onTouchend: onMouseup,
  }
}
