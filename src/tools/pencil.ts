import type { ComputedRef, Ref } from "vue"
import type { ToolEventsObject } from "./type"

const defaultPencilConfig = {
    color: '#000',
    lineWidth: 10
}
export function initPencil(context: Ref<CanvasRenderingContext2D | null> | ComputedRef<CanvasRenderingContext2D | null>): ToolEventsObject {
    let isPainting = false
    const lastAxis = {
        x: 0,
        y: 0
    }
    const emptyEventFun = (e: MouseEvent) => { }
    context.value!.lineWidth = defaultPencilConfig.lineWidth
    context.value!.strokeStyle = defaultPencilConfig.color
    context.value!.fillStyle = defaultPencilConfig.color
    // 画点函数
    const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
        let startAngle = 0
        let endAngle = Math.PI * 2
        let anticlockwise = true
        ctx.moveTo(x, y)
        ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        ctx.fill();
    }

    // 划线函数
    const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number) => {
        // ctx.save()
        ctx.lineWidth = width
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
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
            context.value!.beginPath()
            drawCircle(context.value!, sx, sy, context.value!.lineWidth / 2)
            context.value!.closePath()
            context.value!.beginPath()
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
        onMousedown: useThrottleFn(onMousedown, 10),
        onMousemove: useThrottleFn(onMousemove, 10),
        onMouseup,
        onMouseleave
    }
}