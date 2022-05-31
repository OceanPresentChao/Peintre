import type { ComputedRef, Ref } from "vue"
import type { ToolEventsObject } from "./type"
export const EraserConfig = {
    delay: 10
}
export function useEraser(context: Ref<CanvasRenderingContext2D | null> | ComputedRef<CanvasRenderingContext2D | null>, revert?: () => void): ToolEventsObject {
    let isClearing = false
    const lastAxis = {
        x: 0,
        y: 0
    }

    const emptyEventFun = (e: MouseEvent) => { }
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
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.globalCompositeOperation = "destination-out"
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
    }
    const onMousedown = (e: MouseEvent) => {
        let sx, sy = 0
        isClearing = true
        sx = e.offsetX - context.value!.canvas!.offsetLeft;
        sy = e.offsetY - context.value!.canvas!.offsetTop;
        lastAxis.x = sx
        lastAxis.y = sy
        if (isClearing) {
            clearCircle(context.value!, sx, sy, context.value!.lineWidth / 2)
        }
    }
    const onMousemove = (e: MouseEvent) => {
        let mx, my = 0
        mx = e.offsetX - context.value!.canvas!.offsetLeft;
        my = e.offsetY - context.value!.canvas!.offsetTop;
        if (isClearing) {
            clearLine(context.value!, lastAxis.x, lastAxis.y, mx, my, context.value!.lineWidth)
            lastAxis.x = mx
            lastAxis.y = my
        }
    }
    const onMouseup = (e: MouseEvent) => {
        isClearing = false
        context.value!.closePath()
    }
    const onMouseleave = emptyEventFun
    return {
        onMousedown: useThrottleFn(onMousedown, EraserConfig.delay),
        onMousemove: useThrottleFn(onMousemove, EraserConfig.delay),
        onMouseup,
        onMouseleave
    }
}