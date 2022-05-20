import type { ComputedRef, Ref } from "vue"
import type { ToolEventsObject } from "./type"
export const PencilDelay = 10
export function usePencil(context: Ref<CanvasRenderingContext2D | null> | ComputedRef<CanvasRenderingContext2D | null>): ToolEventsObject {
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
        let sx, sy = 0
        isPainting = true
        sx = e.offsetX - context.value!.canvas!.offsetLeft;
        sy = e.offsetY - context.value!.canvas!.offsetTop;
        lastAxis.x = sx
        lastAxis.y = sy
        if (isPainting) {
            drawCircle(context.value!, sx, sy, context.value!.lineWidth / 2)
        }
    }
    const onMousemove = (e: MouseEvent) => {
        let mx, my = 0
        mx = e.offsetX - context.value!.canvas!.offsetLeft;
        my = e.offsetY - context.value!.canvas!.offsetTop;
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
        onMousedown: useThrottleFn(onMousedown, PencilDelay),
        onMousemove: useThrottleFn(onMousemove, PencilDelay),
        onMouseup,
        onMouseleave
    }
}