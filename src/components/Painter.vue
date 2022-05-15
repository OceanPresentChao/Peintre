<template>
  <div>
    <header>
      <!-- Header content -->
      <el-button type="primary" size="default" @click="toggleCanvas">Show Canvas</el-button>
    </header>
    <div v-show="showCanvas">
      <!-- Main content -->
      <div>
        <el-button type="primary" size="default" @click="addLayer">Add Layer</el-button>
        <el-button type="primary" size="default" @click="changeTool(Tool.pencil)">Pencil</el-button>
        <el-button type="primary" size="default" @click="changeTool(Tool.eraser)">Eraser</el-button>
      </div>
      <div class="relative">
        <canvas v-for="layer in layers" :ref="setCanvasRef" class="absolute top-0" :width="config.width"
          :height="config.height"></canvas>
      </div>
      {{ currentLayerNum }}
    </div>

  </div>
</template>

<script setup lang="ts">import type { ComputedRef } from 'vue';

const showCanvas = ref(true)
function toggleCanvas() {
  showCanvas.value = !showCanvas.value
}
const config = {
  width: 800,
  height: 600,
  top: 0
}
const defaultPencilConfig = {
  color: '#000',
  lineWidth: 10
}
const canvasRefs = ref<HTMLCanvasElement[]>([])
function setCanvasRef(el: any) {
  if (el) {
    if (canvasRefs.value.includes(el)) return
    canvasRefs.value.push(el as HTMLCanvasElement)
  }
}
const layers = ref<Array<any>>([{ a: 100 }, { b: 200 }])
const currentLayerRef: ComputedRef<HTMLCanvasElement | null> = computed(() => {
  if (canvasRefs.value.length) {
    return canvasRefs.value[canvasRefs.value.length - 1]
  } else {
    return null
  }
})
const currentLayerNum: ComputedRef<number | null> = computed(() => {
  if (canvasRefs.value.length) {
    return canvasRefs.value.length - 1
  } else {
    return null
  }
})
let currentCtx: ComputedRef<CanvasRenderingContext2D | null> = computed(() => {
  if (!currentLayerRef.value) return null
  return currentLayerRef.value.getContext('2d')
})
function addLayer() {
  if (!layers.value) return
  layers.value.push({ c: 200 })
  console.log(canvasRefs);
}


enum Tool {
  pencil = 0,
  eraser
}
interface ToolEventsObject {
  onMousedown: (e: MouseEvent) => any
  onMousemove: (e: MouseEvent) => any
  onMouseup: (e: MouseEvent) => any
  onMouseleave: (e: MouseEvent) => any
}

let currentTool = Tool.pencil
function changeTool(type: Tool) {
  currentTool = type
}
function initTools() {
  const pencil = initPencil()
  const eraser = initEraser()
  const getCurrentToolEvents: () => ToolEventsObject = () => {
    if (currentTool === Tool.pencil) {
      return pencil
    } else if (currentTool === Tool.eraser) {
      return eraser
    } else {
      return pencil
    }
  }
  const onMousedown = (e: MouseEvent) => {
    console.log(currentTool);
    getCurrentToolEvents().onMousedown(e)
  }
  const onMousemove = (e: MouseEvent) => {
    getCurrentToolEvents().onMousemove(e)
  }
  const onMouseup = (e: MouseEvent) => {
    getCurrentToolEvents().onMouseup(e)
  }
  const onMouseleave = (e: MouseEvent) => {
    getCurrentToolEvents().onMouseleave(e)
  }
  currentLayerRef.value!.onmousedown = onMousedown
  currentLayerRef.value!.onmousemove = onMousemove
  currentLayerRef.value!.onmouseup = onMouseup
  currentLayerRef.value!.onmouseleave = onMouseleave
}
onMounted(() => {
  initTools()
})

// 画点函数
function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  let startAngle = 0
  let endAngle = Math.PI * 2
  let anticlockwise = true
  ctx.moveTo(x, y)
  ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  ctx.fill();
}

// 划线函数
function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number) {
  // ctx.save()
  ctx.lineWidth = width
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  // ctx.restore()
}

let lastAxis = {
  x: 0,
  y: 0
}
function initPencil(): ToolEventsObject {
  let isPainting = false
  let ctx = currentCtx.value!
  ctx.lineWidth = defaultPencilConfig.lineWidth
  ctx.strokeStyle = defaultPencilConfig.color
  ctx.fillStyle = defaultPencilConfig.color
  const onMousedown = (e: MouseEvent) => {
    let sx, sy = 0
    isPainting = true
    sx = e.offsetX - currentLayerRef.value!.offsetLeft;
    sy = e.offsetY - currentLayerRef.value!.offsetTop;
    lastAxis.x = sx
    lastAxis.y = sy
    if (isPainting) {
      ctx.beginPath()
      drawCircle(ctx, sx, sy, ctx.lineWidth / 2)
      ctx.closePath()
      ctx.beginPath()
    }
  }
  const onMousemove = (e: MouseEvent) => {
    let mx, my = 0
    mx = e.offsetX - currentLayerRef.value!.offsetLeft;
    my = e.offsetY - currentLayerRef.value!.offsetTop;
    // const cbx = ctx.getImageData(
    //   e.offsetX - ctx.lineWidth / 2,
    //   e.offsetY - ctx.lineWidth / 2,
    //   ctx.lineWidth * 2,
    //   ctx.lineWidth * 2
    // );
    if (isPainting) {
      // drawCircle(ctx, mx, my, ctx.lineWidth)
      drawLine(ctx, lastAxis.x, lastAxis.y, mx, my, ctx.lineWidth)
      lastAxis.x = mx
      lastAxis.y = my
    }
  }
  const onMouseup = (e: MouseEvent) => {
    isPainting = false
    ctx.closePath()
  }
  const onMouseleave = onMouseup
  return {
    onMousedown: useThrottleFn(onMousedown, 10),
    onMousemove: useThrottleFn(onMousemove, 10),
    onMouseup,
    onMouseleave
  }

}

function initEraser(): ToolEventsObject {
  let isClearing = false
  let ctx = currentCtx.value!
  const onMousedown = (e: MouseEvent) => {
    let sx, sy = 0
    isClearing = true
    sx = e.offsetX - currentLayerRef.value!.offsetLeft;
    sy = e.offsetY - currentLayerRef.value!.offsetTop;
    lastAxis.x = sx
    lastAxis.y = sy
    if (isClearing) {
      // ctx.globalCompositeOperation = "destination-out"
      // ctx.arc(sx, sy, ctx.lineWidth / 2, 0, Math.PI * 2)
      // ctx.clip()
      // ctx.clearRect(sx, sy, ctx.lineWidth, ctx.lineWidth)
    }
  }
  const onMousemove = (e: MouseEvent) => {
    let mx, my = 0
    mx = e.offsetX - currentLayerRef.value!.offsetLeft;
    my = e.offsetY - currentLayerRef.value!.offsetTop;

  }
  const onMouseup = (e: MouseEvent) => {
    isClearing = false
    // ctx.closePath()
  }
  const onMouseleave = onMouseup
  return {
    onMousedown,
    onMousemove,
    onMouseup,
    onMouseleave
  }
}
</script>

<style scoped>
</style>