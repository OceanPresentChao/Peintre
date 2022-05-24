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
        <el-button type="success" size="default" @click="changeTool(Tool.pencil)">Pencil</el-button>
        <el-button type="success" size="default" @click="changeTool(Tool.eraser)">Eraser</el-button>
        <el-button type="success" size="default" @click="changeTool(Tool.line)">Line</el-button>
        <el-button type="success" size="default" @click="changeTool(Tool.rectangle)">
          <span v-show="currentToolConfig.isRectFill">RectangleFilled</span>
          <span v-show="!currentToolConfig.isRectFill">RectangleStroked</span>
        </el-button>
        <el-button type="success" size="default" @click="changeTool(Tool.ellipse)">
          <span v-show="currentToolConfig.isEllipseFill">EllipseFillFilled</span>
          <span v-show="!currentToolConfig.isEllipseFill">EllipseFillStroked</span>
        </el-button>
        <el-button type="primary" size="default" @click="clearCtx(currentCtx)">Clear</el-button>
        <el-button type="primary" size="default" @click="goPrevious" :disabled="layeridStack.length <= 0">Previous
        </el-button>
      </div>
      <div>
        strokecolor：
        <el-color-picker v-model="currentToolConfig.strokecolor" :predefine="predefineColors" />
        fillcolor：
        <el-color-picker show-alpha v-model="currentToolConfig.fillcolor" :predefine="predefineColors" />
        <el-slider v-model="currentToolConfig.linewidth" show-input :min="PencilConfig.minWidth"
          :max="PencilConfig.maxWidth" :step="1" />
      </div>
      <div class="relative cursor-none" ref="canvasContainerRef">
        <canvas :width="CanvasConfig.width" :height="CanvasConfig.height" ref="cursorRef"
          class="absolute top-0"></canvas>
        <canvas v-for="layer in layers" :ref="setCanvasRef" :key="layer.id" class="absolute top-0"
          :width="CanvasConfig.width" :height="CanvasConfig.height"></canvas>
        <canvas :width="CanvasConfig.width" :height="CanvasConfig.height"></canvas>
      </div>
      <div>
        current layer id:{{ currentLayer?.id }}
        layers num:{{ canvasRefs.length }}
      </div>
      <div>
        <draggable v-model="layers" item-key="id" ghost-class="ghost" @start="isDragging = true"
          @end="isDragging = false">
          <template #item="{ element }">
            <el-button type="danger" size="default" text @click="changeLayer(element.id)">
              {{ element.imageStack }}
            </el-button>
          </template>
        </draggable>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef, Ref } from 'vue';
import { nanoid } from "nanoid"
import { PencilConfig, useEraser, useLine, usePencil } from '@/tools';
import type { ToolEventsObject } from '@/tools/type';
import { CanvasConfig } from '@/utils/config';
import { useRectangle } from '@/tools/rectangle';
import { useEllipse } from '@/tools/ellipse';
import draggable from 'vuedraggable';
const showCanvas = ref(true)
function toggleCanvas() {
  showCanvas.value = !showCanvas.value
}

interface Layer extends Object {
  id: string
  canvas: HTMLCanvasElement | null
  context: CanvasRenderingContext2D | null
  imageStack: Array<ImageData>
}

const isDragging = ref(false)
// const layers:Ref<LayerContainer> = useLocalStorage("canvasLayers", {})
const layers = ref<Array<Layer>>([])
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
  if (!currentLayer.value || !currentLayer.value.canvas) return null
  const ctx = currentLayer.value.canvas.getContext('2d')
  return ctx
})

function findLayer(layerid: string): Layer | null {
  for (const layer of layers.value) {
    if (layer.id === layerid) {
      return layer
    }
  }
  return null
}
function addLayer() {
  if (!layers.value) return
  const id = nanoid()
  const newlayer: Layer = { id: id, canvas: null, context: null, imageStack: [] }
  layers.value.push(newlayer)
  nextTick(() => {
    newlayer.canvas = canvasRefs.value[canvasRefs.value.length - 1]
    newlayer.context = canvasRefs.value[canvasRefs.value.length - 1].getContext("2d")
    currentLayer.value = newlayer
    // console.log(layers);
  })
}
function changeLayer(layerid: string) {
  const layer = findLayer(layerid)
  if (!layer) return
  currentLayer.value = layer
}

enum Tool {
  pencil = 0,
  eraser,
  line,
  rectangle,
  ellipse
}

const currentToolConfig = ref<{
  tool: Tool,
  strokecolor: string,
  fillcolor: string,
  linewidth: number,
  isRectFill: boolean,
  isEllipseFill: boolean
}>({
  tool: Tool.pencil,
  strokecolor: 'rgba(255, 69, 0)',
  fillcolor: 'rgba(255, 69, 0)',
  linewidth: 5,
  isRectFill: false,
  isEllipseFill: false
})

function changeTool(type: Tool) {
  currentToolConfig.value.tool = type
}
function initTools() {
  const revert = () => {
    if (!lastLayer.value) return
    const imageStack = lastLayer.value.imageStack
    if (imageStack.length > 0) {
      const image = imageStack[imageStack.length - 1]!
      drawImageData(lastLayer.value.canvas, image)
    }
  }
  const pencil = usePencil(currentCtx, revert)
  const eraser = useEraser(currentCtx, revert)
  const line = useLine(currentCtx, revert)
  const rectangle = useRectangle(currentCtx, revert)
  const ellipse = useEllipse(currentCtx, revert)

  // const circle = useLine(currentCtx, revert)
  const getcurrentToolEvents: () => ToolEventsObject = () => {
    if (currentToolConfig.value.tool === Tool.pencil) {
      return pencil
    } else if (currentToolConfig.value.tool === Tool.eraser) {
      return eraser
    } else if (currentToolConfig.value.tool === Tool.line) {
      return line
    } else if (currentToolConfig.value.tool === Tool.rectangle) {
      return rectangle
    } else if (currentToolConfig.value.tool === Tool.ellipse) {
      return ellipse
    } else {
      return pencil
    }
  }
  const onMousedown = (e: MouseEvent) => {
    console.log(Tool[currentToolConfig.value.tool]);
    layeridStack.value.push(currentLayer.value!.id)
    pushImage(currentLayer.value!.id, getImageData(currentLayer.value!.canvas))
    getcurrentToolEvents().onMousedown(e)
  }
  const onMousemove = (e: MouseEvent) => {
    getcurrentToolEvents().onMousemove(e)
  }
  const onMouseup = (e: MouseEvent) => {
    getcurrentToolEvents().onMouseup(e)
  }
  const onMouseleave = (e: MouseEvent) => {
    getcurrentToolEvents().onMouseleave(e)
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
    ctx.arc(mx, my, currentToolConfig.value.linewidth / 2, 0, Math.PI * 2)
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
    if (event.deltaY >= 0 && currentToolConfig.value.linewidth > PencilConfig.minWidth) {
      currentToolConfig.value.linewidth -= Math.abs(Math.round(event.deltaY / 100) * 5)
    } else if (event.deltaY < 0 && currentToolConfig.value.linewidth < PencilConfig.maxWidth) {
      currentToolConfig.value.linewidth += Math.abs(Math.round(event.deltaY / 100) * 5)
    }
    console.log(currentToolConfig.value.linewidth);
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

function clearCtx(context: CanvasRenderingContext2D | HTMLCanvasElement | null) {
  if (!context) return
  if (layeridStack.value.length > 0) {
    layeridStack.value.push(currentLayer.value!.id)
    pushImage(currentLayer.value!.id, getImageData(currentLayer.value!.canvas))
  }
  if (context instanceof CanvasRenderingContext2D) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
  } else {
    let ctx = context.getContext("2d")
    if (!ctx) return null
    ctx.clearRect(0, 0, context.width, context.height)
  }
}

const predefineColors = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgb(255, 69, 0)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsv(120, 40, 94)',
  'hsl(181, 100%, 37%)',
  'hsl(209, 100%, 56%)',
  '#c7158577',
]


onMounted(() => {
  nextTick(() => {
    watch([currentCtx, currentToolConfig], ([ctx, config]) => {
      if (!ctx) return
      if (currentToolConfig.value.tool === Tool.pencil || currentToolConfig.value.tool === Tool.eraser || currentToolConfig.value.tool === Tool.line) {
        ctx.strokeStyle = config.strokecolor
        ctx.fillStyle = config.strokecolor
        ctx.lineWidth = config.linewidth
      } else if (currentToolConfig.value.tool === Tool.rectangle) {
        ctx.strokeStyle = config.strokecolor
        ctx.fillStyle = config.fillcolor
        ctx.lineWidth = config.linewidth
      }
    }, { immediate: true, deep: true })
  })
})

const layeridStack = ref<Array<string>>([])
const lastLayer = computed(() => {
  if (layeridStack.value.length > 0) {
    const lastid = layeridStack.value[layeridStack.value.length - 1]
    const layer = findLayer(lastid)
    if (!layer) return null
    return layer
  } else {
    return null
  }
})

function pushImage(layerid: string, data: ImageData | null) {
  if (!data) {
    return
  }
  const layer = findLayer(layerid)
  if (!layer) return
  layer.imageStack.push(data)
}

function drawImageData(context: CanvasRenderingContext2D | HTMLCanvasElement | null, data: ImageData | null) {
  if (!context || !data) return
  if (context instanceof CanvasRenderingContext2D) {
    context.putImageData(data, 0, 0)
  } else {
    let ctx = context.getContext("2d")
    if (!ctx) return null
    ctx.putImageData(data, 0, 0)
  }
}

function getImageData(context: CanvasRenderingContext2D | HTMLCanvasElement | null): ImageData | null {
  if (!context) return null
  if (context instanceof CanvasRenderingContext2D) {
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height)
  } else {
    let ctx = context.getContext("2d")
    if (!ctx) return null
    return ctx.getImageData(0, 0, context.width, context.height)
  }

}

function goPrevious() {
  if (!lastLayer.value) return
  const imageStack = lastLayer.value.imageStack
  if (imageStack.length > 0) {
    const image = imageStack.pop()!
    drawImageData(lastLayer.value.canvas, image)
  }
  layeridStack.value.pop()
}

</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>