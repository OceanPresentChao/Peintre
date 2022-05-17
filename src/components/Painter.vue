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
import type { ComputedRef, Ref } from 'vue';
import { nanoid } from "nanoid"
import { initEraser, initPencil } from '@/tools';
import type { ToolEventsObject } from '@/tools/type';
const showCanvas = ref(true)
function toggleCanvas() {
  showCanvas.value = !showCanvas.value
}
const config = {
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


let currentTool = Tool.pencil
function changeTool(type: Tool) {
  currentTool = type
}
function initTools() {
  const pencil = initPencil(currentCtx)
  const eraser = initEraser(currentCtx)
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





</script>

<style scoped>
</style>