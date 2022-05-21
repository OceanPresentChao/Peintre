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
        <el-button type="primary" size="default" @click="clearCtx">Clear</el-button>
      </div>
      <div>
        <el-color-picker v-model="currentColor" :predefine="predefineColors" />
        <el-slider v-model="currentLineWidth" show-input :min="PencilConfig.minWidth" :max="PencilConfig.maxWidth"
          :step="1" />
      </div>
      <div class="relative cursor-none" ref="canvasContainerRef">
        <canvas :width="CanvasConfig.width" :height="CanvasConfig.height" ref="cursorRef"
          class="absolute top-0"></canvas>
        <canvas v-for="layer in layers" :ref="setCanvasRef" class="absolute top-0" :width="CanvasConfig.width"
          :height="CanvasConfig.height"></canvas>
        <canvas :width="CanvasConfig.width" :height="CanvasConfig.height"></canvas>
      </div>
      <div>
        current layer id:{{ currentLayer?.id }}
        layers num:{{ canvasRefs.length }}
      </div>
      <div>
        <el-button type="danger" size="default" text v-for="layer in layers" @click="changeLayer(layer.id)">{{ layer }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef, Ref } from 'vue';
import { nanoid } from "nanoid"
import { PencilConfig, useEraser, usePencil } from '@/tools';
import type { ToolEventsObject } from '@/tools/type';
import { CanvasConfig } from '@/utils/config';
const showCanvas = ref(true)
function toggleCanvas() {
  showCanvas.value = !showCanvas.value
}

interface Layer extends Object {
  id: string
  canvas: HTMLCanvasElement | null
}
interface LayerContainer {
  [layerid: string]: Layer
}
// const layers:Ref<LayerContainer> = useLocalStorage("canvasLayers", {})
const layers = ref<LayerContainer>({})
const canvasContainerRef = ref<HTMLDivElement | null>(null)
const canvasRefs = ref<HTMLCanvasElement[]>([])
function setCanvasRef(el: any) {
  if (el) {
    if (canvasRefs.value.includes(el)) return
    canvasRefs.value.push(el as HTMLCanvasElement)
  }
}
const cursorRef = ref<HTMLCanvasElement | null>(null)

let currentLayer = ref<Layer | null>(null)

let currentCtx: ComputedRef<CanvasRenderingContext2D | null> = computed(() => {
  // console.log("CTX change!");
  if (!currentLayer.value || !currentLayer.value.canvas) return null
  const ctx = currentLayer.value.canvas.getContext('2d')
  // if (ctx) ctx.globalCompositeOperation = 'destination-atop';
  return ctx
})
function addLayer() {
  if (!layers.value) return
  const id = nanoid()
  const newlayer: Layer = { id: id, canvas: null }
  layers.value[id] = newlayer
  nextTick(() => {
    layers.value[id].canvas = canvasRefs.value[canvasRefs.value.length - 1]
    currentLayer.value = newlayer
    // console.log(layers);
  })
}
function changeLayer(layerid: string) {
  currentLayer.value = layers.value[layerid]
}

enum Tool {
  pencil = 0,
  eraser
}

let currentTool = Tool.pencil
function changeTool(type: Tool) {
  currentTool = type
}
function initTools() {
  const pencil = usePencil(currentCtx)
  const eraser = useEraser(currentCtx)
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
  canvasContainerRef.value!.addEventListener("mousedown", onMousedown)
  canvasContainerRef.value!.addEventListener("mousemove", onMousemove)
  canvasContainerRef.value!.addEventListener("mouseup", onMouseup)
  canvasContainerRef.value!.addEventListener("mouseleave", onMouseleave)
}

function initCursor() {
  const ctx = cursorRef.value!.getContext("2d")
  if (!ctx) return
  const onMousemove = (e: MouseEvent) => {
    const mx = e.offsetX - ctx.canvas!.offsetLeft;
    const my = e.offsetY - ctx.canvas!.offsetTop;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.beginPath()
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 0.5
    ctx.arc(mx, my, currentLineWidth.value / 2, 0, Math.PI * 2)
    ctx.stroke()
    ctx.closePath()
  }
  const onMouseleave = (e: MouseEvent) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }
  canvasContainerRef.value!.addEventListener("mousemove", useThrottleFn(onMousemove, PencilConfig.delay))
  canvasContainerRef.value!.addEventListener("mouseleave", onMouseleave)
}

function initScroll() {
  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    if (event.deltaY >= 0 && currentLineWidth.value > PencilConfig.minWidth) {
      currentLineWidth.value -= Math.abs(Math.round(event.deltaY / 100) * 5)
    } else if (event.deltaY < 0 && currentLineWidth.value < PencilConfig.maxWidth) {
      currentLineWidth.value += Math.abs(Math.round(event.deltaY / 100) * 5)
    }
    console.log(currentLineWidth.value);
  }
  canvasContainerRef.value!.addEventListener("wheel", onWheel)

}

function initPainter() {
  addLayer()
  initTools()
  initCursor()
  initScroll()
}

onMounted(() => {
  initPainter()
})

function clearCtx() {
  currentCtx.value!.clearRect(0, 0, currentCtx.value!.canvas.width, currentCtx.value!.canvas.height)
}

const currentColor = ref('rgba(255, 69, 0)')
const predefineColors = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsv(120, 40, 94)',
  'hsl(181, 100%, 37%)',
  'hsl(209, 100%, 56%)',
  '#c7158577',
]

const currentLineWidth = ref(5)

onMounted(() => {
  nextTick(() => {
    watch([currentCtx, currentColor, currentLineWidth], ([ctx, color, width]) => {
      if (!ctx) return
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = width
    }, { immediate: true })
  })
})

</script>

<style scoped>
</style>