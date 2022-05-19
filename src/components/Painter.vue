usePenciluseEraser<template>
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
      <div>
        <el-color-picker v-model="currentColor" :predefine="predefineColors" />
        <el-slider v-model="currentLineWidth" show-input :min="1" :max="500" :step="1" />
      </div>
      <div class="relative" ref="canvasContainerRef">
        <canvas v-for="layer in layers" :ref="setCanvasRef" class="absolute top-0" :width="canvasConfig.width"
          :height="canvasConfig.height"></canvas>
        <canvas :width="canvasConfig.width" :height="canvasConfig.height"></canvas>
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
import type { ComputedRef, Ref } from 'vue';
import { nanoid } from "nanoid"
import { useEraser, usePencil } from '@/tools';
import type { ToolEventsObject } from '@/tools/type';
const showCanvas = ref(true)
function toggleCanvas() {
  showCanvas.value = !showCanvas.value
}
const canvasConfig = {
  width: 800,
  height: 600,
  top: 0
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
  canvasContainerRef.value!.onmousedown = onMousedown
  canvasContainerRef.value!.onmousemove = onMousemove
  canvasContainerRef.value!.onmouseup = onMouseup
  canvasContainerRef.value!.onmouseleave = onMouseleave
}

function initPainter() {
  addLayer()
  initTools()
}

onMounted(() => {
  initPainter()
})


const currentColor = ref('rgba(255, 69, 0, 0.68)')
const predefineColors = ref([
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
])

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