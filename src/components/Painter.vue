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

function changeTool(type: Tool) {
  let sx, sy = 0
  isableDraw.value = false
  const onMousedown = (e: MouseEvent) => {
    currentCtx.value!.strokeStyle = defaultPencilConfig.color
    currentCtx.value!.lineWidth = defaultPencilConfig.lineWidth
    sx = e.clientX - currentLayerRef.value!.offsetLeft
    sy = e.clientY - currentLayerRef.value!.offsetTop
    currentCtx.value!.moveTo(sx, sy)
    isableDraw.value = true
  }
  if (type === Tool.pencil) {
    initPencil()
  } else if (type === Tool.eraser) {

  }
  currentLayerRef.value!.onmousedown = onMousedown
}
const isableDraw = ref(false)
function initPencil() {
  let mx, my = 0
  const onMousedown = (e: MouseEvent) => {
    alert(e);
    currentCtx.value!.beginPath()
  }
  const onMousemove = (e: MouseEvent) => {
    mx = e.clientX - currentLayerRef.value!.offsetLeft;
    my = e.clientY - currentLayerRef.value!.offsetTop;
    // const cbx = currentCtx.value!.getImageData(
    //   e.offsetX - currentCtx.value!.lineWidth / 2,
    //   e.offsetY - currentCtx.value!.lineWidth / 2,
    //   currentCtx.value!.lineWidth * 2,
    //   currentCtx.value!.lineWidth * 2
    // );
    if (isableDraw.value) {
      currentCtx.value!.lineTo(mx - 8, my - 49)
      currentCtx.value!.stroke()
    }
  }
  const onMouseup = (e: MouseEvent) => {
    isableDraw.value = false
    currentCtx.value!.closePath()
  }
  currentLayerRef.value!.onmousedown = onMousedown
  currentLayerRef.value!.onmousemove = onMousemove
  currentLayerRef.value!.onmouseup = onMouseup
  currentLayerRef.value!.onmouseleave = onMouseup
}
</script>

<style scoped>
</style>