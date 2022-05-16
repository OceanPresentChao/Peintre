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
      <div class="relative" ref="canvasContainerRef">
        <canvas v-for="layer in layers" :ref="setCanvasRef" class="absolute top-0" :width="config.width"
          :height="config.height"></canvas>
        <canvas :width="config.width" :height="config.height"></canvas>
      </div>
      <div>
        current layer id:{{ currentLayer?.id }}
        layers num:{{ canvasRefs.length }}
      </div>
      <div>
        <el-button type="primary" size="default" text v-for="layer in layers" @click="changeLayer(layer.id)">{{ layer }}
        </el-button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import { nanoid } from "nanoid"

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
interface Layer extends Object {
  id: string
  canvas: HTMLCanvasElement | null
}
interface LayerContainer {
  [layerid: string]: Layer
}
const layers = ref<LayerContainer>({})
const canvasContainerRef = ref<HTMLDivElement | null>(null)
const canvasRefs = ref<HTMLCanvasElement[]>([])
function setCanvasRef(el: any) {
  if (el) {
    if (canvasRefs.value.includes(el)) return
    canvasRefs.value.push(el as HTMLCanvasElement)
  }
}
let currentLayer = ref<Layer | null>(null)
const currentLayerRef: ComputedRef<HTMLCanvasElement | null> = computed(() => {
  console.log("LAYER REF CHANGE!");
  if (!currentLayer.value) { return null }
  return currentLayer.value.canvas
})
let currentCtx: ComputedRef<CanvasRenderingContext2D | null> = computed(() => {
  console.log("CTX change!");
  if (!currentLayer.value || !currentLayer.value.canvas) return null
  return currentLayer.value.canvas.getContext('2d')
})
function addLayer() {
  if (!layers.value) return
  const id = nanoid()
  const newlayer: Layer = { id: id, canvas: null }
  layers.value[id] = newlayer
  nextTick(() => {
    layers.value[id].canvas = canvasRefs.value[canvasRefs.value.length - 1]
    currentLayer.value = newlayer
    console.log(layers);
  })
}
function changeLayer(layerid: string) {
  currentLayer.value = layers.value[layerid]
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
    console.log(Tool[currentTool]);
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
  canvasContainerRef.value!.onmousedown = onMousedown
  canvasContainerRef.value!.onmousemove = onMousemove
  canvasContainerRef.value!.onmouseup = onMouseup
  canvasContainerRef.value!.onmouseleave = onMouseleave
}
addLayer()
onMounted(() => {
  nextTick(() => {
    initTools()
  })
})

let lastAxis = {
  x: 0,
  y: 0
}

const emptyEventFun = (e: MouseEvent) => { }
function initPencil(): ToolEventsObject {
  let isPainting = false
  currentCtx.value!.lineWidth = defaultPencilConfig.lineWidth
  currentCtx.value!.strokeStyle = defaultPencilConfig.color
  currentCtx.value!.fillStyle = defaultPencilConfig.color
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
    sx = e.offsetX - currentLayerRef.value!.offsetLeft;
    sy = e.offsetY - currentLayerRef.value!.offsetTop;
    lastAxis.x = sx
    lastAxis.y = sy
    if (isPainting) {
      currentCtx.value!.beginPath()
      drawCircle(currentCtx.value!, sx, sy, currentCtx.value!.lineWidth / 2)
      currentCtx.value!.closePath()
      currentCtx.value!.beginPath()
    }
  }
  const onMousemove = (e: MouseEvent) => {
    let mx, my = 0
    mx = e.offsetX - currentLayerRef.value!.offsetLeft;
    my = e.offsetY - currentLayerRef.value!.offsetTop;
    if (isPainting) {
      // drawCircle(ctx, mx, my, ctx.lineWidth)
      drawLine(currentCtx.value!, lastAxis.x, lastAxis.y, mx, my, currentCtx.value!.lineWidth)
      lastAxis.x = mx
      lastAxis.y = my
    }
  }
  const onMouseup = (e: MouseEvent) => {
    isPainting = false
    currentCtx.value!.closePath()
  }
  const onMouseleave = emptyEventFun
  return {
    onMousedown: useThrottleFn(onMousedown, 10),
    onMousemove: useThrottleFn(onMousemove, 10),
    onMouseup,
    onMouseleave
  }
}

function initEraser(): ToolEventsObject {
  let isClearing = false
  const clearCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    ctx.save()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
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
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.restore()
  }
  const onMousedown = (e: MouseEvent) => {
    let sx, sy = 0
    isClearing = true
    sx = e.offsetX - currentLayerRef.value!.offsetLeft;
    sy = e.offsetY - currentLayerRef.value!.offsetTop;
    lastAxis.x = sx
    lastAxis.y = sy
    if (isClearing) {
      currentCtx.value!.beginPath()
      clearCircle(currentCtx.value!, sx, sy, currentCtx.value!.lineWidth / 2)
      currentCtx.value!.closePath()
      currentCtx.value!.beginPath()
    }
  }
  const onMousemove = (e: MouseEvent) => {
    let mx, my = 0
    mx = e.offsetX - currentLayerRef.value!.offsetLeft;
    my = e.offsetY - currentLayerRef.value!.offsetTop;
    if (isClearing) {
      clearLine(currentCtx.value!, lastAxis.x, lastAxis.y, mx, my, currentCtx.value!.lineWidth)
      lastAxis.x = mx
      lastAxis.y = my
    }
  }
  const onMouseup = (e: MouseEvent) => {
    isClearing = false
    currentCtx.value!.closePath()
  }
  const onMouseleave = emptyEventFun
  return {
    onMousedown: useThrottleFn(onMousedown, 10),
    onMousemove: useThrottleFn(onMousemove, 10),
    onMouseup,
    onMouseleave
  }
}
</script>

<style scoped>
</style>