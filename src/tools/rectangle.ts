import type { Point, ToolEventsObject } from './type'
export const RectConfig = {
  delay: 10,
}
export function useRectangle(context: CanvasRenderingContext2D, revert?: () => void): ToolEventsObject {
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
      ctx.rect(startAxis.x, startAxis.y, endAxis.x - startAxis.x, endAxis.y - startAxis.y)
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
    }
  }
  const onMouseup = (location: Point) => {
    endAxis.x = location.x
    endAxis.y = location.y
    isPainting = false
    context.closePath()
  }
  return {
    onMousedown: useThrottleFn(onMousedown, RectConfig.delay),
    onMousemove: useThrottleFn(onMousemove, RectConfig.delay),
    onMouseup,
    onTouchstart: useThrottleFn(onMousedown, RectConfig.delay),
    onTouchmove: useThrottleFn(onMousemove, RectConfig.delay),
    onTouchend: onMouseup,
  }
}
