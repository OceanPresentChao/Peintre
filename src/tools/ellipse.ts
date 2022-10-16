import type { Point, ToolEventsObject } from './type'
export const EllipseConfig = {
  delay: 10,
}
export function useEllipse(context: CanvasRenderingContext2D, revert?: () => void): ToolEventsObject {
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
      ctx.ellipse(startAxis.x, startAxis.y, Math.abs(Math.round((endAxis.x - startAxis.x) / 2)), Math.abs(Math.round((endAxis.y - startAxis.y) / 2)), 0, 0, Math.PI * 2)
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
    }
  }
  const onMouseup = (location: Point) => {
    endAxis.x = location.x
    endAxis.y = location.y
    isPainting = false
  }

  return {
    onMousedown: useThrottleFn(onMousedown, EllipseConfig.delay),
    onMousemove: useThrottleFn(onMousemove, EllipseConfig.delay),
    onMouseup,
    onTouchstart: useThrottleFn(onMousedown, EllipseConfig.delay),
    onTouchmove: useThrottleFn(onMousemove, EllipseConfig.delay),
    onTouchend: onMouseup,
  }
}
