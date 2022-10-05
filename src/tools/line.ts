import type { ComputedRef, Ref } from "vue"
import { window2canvas } from "./help"
import type { ToolEventsObject } from "./type"
export const LineConfig = {
    delay: 10
}
export function useLine(context: Ref<CanvasRenderingContext2D | null> | ComputedRef<CanvasRenderingContext2D | null>, revert?: () => void): ToolEventsObject {
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
        const {x:sx,y:sy} = window2canvas(context.value?.canvas!,e.clientX,e.clientY)
        startAxis.x = sx
        startAxis.y = sy
        isPainting = true
    }
    const onMousemove = (e: MouseEvent) => {
        if (!context.value || !revert) { return }
        let ctx = context.value
        const {x:ex,y:ey} = window2canvas(context.value?.canvas!,e.clientX,e.clientY)
        endAxis.x = ex
        endAxis.y = ey
        if (isPainting) {
            revert()
            ctx.beginPath()
            context.value.moveTo(startAxis.x, startAxis.y)
            ctx.lineTo(endAxis.x, endAxis.y)
            ctx.closePath()
            ctx.stroke()
        }
    }
    const onMouseup = (e: MouseEvent) => {
        isPainting = false
    }
    const onMouseleave = emptyEventFun
    return {
        onMousedown: useThrottleFn(onMousedown, LineConfig.delay),
        onMousemove: useThrottleFn(onMousemove, LineConfig.delay),
        onMouseup,
        onMouseleave
    }
}