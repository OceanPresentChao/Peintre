import type { ComputedRef, Ref } from "vue"
import type { ToolEventsObject } from "./type"
export const RectConfig = {
    delay: 10,
}
export function useRectangle(context: Ref<CanvasRenderingContext2D | null> | ComputedRef<CanvasRenderingContext2D | null>, revert?: () => void): ToolEventsObject {
    let isPainting = false
    const startAxis = {
        x: 0,
        y: 0
    }
    const endAxis = {
        x: 0,
        y: 0
    }
    const emptyEventFun = (e: MouseEvent) => { }

    const onMousedown = (e: MouseEvent) => {
        if (!context.value) { return }
        startAxis.x = e.offsetX - context.value!.canvas!.offsetLeft
        startAxis.y = e.offsetY - context.value!.canvas!.offsetTop
        isPainting = true
    }
    const onMousemove = (e: MouseEvent) => {
        if (!context.value || !revert) { return }
        let ctx = context.value
        endAxis.x = e.offsetX - context.value!.canvas!.offsetLeft
        endAxis.y = e.offsetY - context.value!.canvas!.offsetTop
        if (isPainting) {
            revert()
            ctx.beginPath()
            context.value.moveTo(startAxis.x, startAxis.y)
            ctx.rect(startAxis.x, startAxis.y, endAxis.x - startAxis.x, endAxis.y - startAxis.y)
            ctx.closePath()
            ctx.stroke()
            ctx.fill()
        }
    }
    const onMouseup = (e: MouseEvent) => {
        isPainting = false
    }
    const onMouseleave = onMouseup
    return {
        onMousedown: useThrottleFn(onMousedown, RectConfig.delay),
        onMousemove: useThrottleFn(onMousemove, RectConfig.delay),
        onMouseup,
        onMouseleave,
    }
}