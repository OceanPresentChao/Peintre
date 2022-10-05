import type { ComputedRef, Ref } from "vue"
import { window2canvas } from "./help"
import type { ToolEventsObject } from "./type"
export const PencilConfig = {
    delay: 10,
    maxWidth: 500,
    minWidth: 1
}
export function usePencil(context: Ref<CanvasRenderingContext2D | null> | ComputedRef<CanvasRenderingContext2D | null>, revert?: () => void): ToolEventsObject {
    let isPainting = false
    const lastAxis = {
        x: 0,
        y: 0
    }
    const emptyEventFun = (e: MouseEvent) => { }
    // 画点函数
    const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
        let startAngle = 0
        let endAngle = Math.PI * 2
        let anticlockwise = true
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        ctx.closePath()
        ctx.fill();
    }

    // 划线函数
    const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number) => {
        // ctx.save()
        ctx.lineWidth = width
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.closePath()
        // ctx.restore()
    }
    const onMousedown = (e: MouseEvent) => {
        if (e.button !== 0) return
        isPainting = true
        const {x:sx,y:sy} = window2canvas(context.value?.canvas!,e.clientX,e.clientY)
        lastAxis.x = sx
        lastAxis.y = sy
        if (isPainting) {
            drawCircle(context.value!, sx, sy, context.value!.lineWidth / 2)
        }
    }
    const onMousemove = (e: MouseEvent) => {
        if (e.button !== 0) return
        const {x:mx,y:my} = window2canvas(context.value?.canvas!,e.clientX,e.clientY)
        if (isPainting) {
            // drawCircle(ctx, mx, my, ctx.lineWidth)
            drawLine(context.value!, lastAxis.x, lastAxis.y, mx, my, context.value!.lineWidth)
            lastAxis.x = mx
            lastAxis.y = my
        }
    }
    const onMouseup = (e: MouseEvent) => {
        isPainting = false
        context.value!.closePath()
    }
    const onMouseleave = emptyEventFun
    return {
        onMousedown: useThrottleFn(onMousedown, PencilConfig.delay),
        onMousemove: useThrottleFn(onMousemove, PencilConfig.delay),
        onMouseup,
        onMouseleave
    }
}