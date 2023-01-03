<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { nanoid } from 'nanoid'
import draggable from 'vuedraggable'
import * as Pressure from 'pressure'
import { window2canvas } from '@/tools/help'
import { PencilConfig, useEllipse, useEraser, useLine, usePencil, useRectangle } from '@/tools'
import type { Layer, ToolEventsObject } from '@/tools/type'
const props = defineProps({
  width: {
    type: Number,
    default: 800,
    validate(value: number) {
      return value > 0
    },
  },
  height: {
    type: Number,
    default: 600,
    validate(value: number) {
      return value > 0
    },
  },
  maxLine: {
    type: Number,
    default: 500,
    validate(value: number) {
      return value > 0
    },
  },
  minLine: {
    type: Number,
    default: 1,
    validate(value: number) {
      return value > 0
    },
  },
  pressure: {
    type: Boolean,
    default: false,
  },
  lang: {
    type: String,
    default: 'en',
  },
})
const { t, locale, availableLocales } = useI18n()

let totalNum = 0
const isDragging = ref(false)
const layers = ref<Array<Layer>>([])
const canvasContainerRef = ref<HTMLDivElement | null>(null)
const canvasRefs = ref<HTMLCanvasElement[]>([])
const cursorRef = ref<HTMLCanvasElement | null>(null)
const imageRef = ref<HTMLCanvasElement | null>(null)
const currentLayer = ref<Layer | null>(null)
const currentCtx: ComputedRef<CanvasRenderingContext2D | null> = computed(() => {
  if (!currentLayer.value || !currentLayer.value.canvas)
    return null
  const ctx = currentLayer.value.canvas.getContext('2d')
  return ctx
})
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

enum Tool {
  pencil = 0,
  eraser,
  line,
  rectangle,
  ellipse,
}

const currentToolConfig = ref<{
  tool: Tool
  strokecolor: string
  fillcolor: string
  linewidth: number
  maxwidth: number
}>({
  tool: Tool.pencil,
  strokecolor: 'rgba(255, 69, 0)',
  fillcolor: 'rgba(255, 69, 0)',
  linewidth: 5,
  maxwidth: 5,
})

const layeridStack = ref<Array<string>>([])
const lastLayer = computed(() => {
  if (layeridStack.value.length > 0) {
    const lastid = layeridStack.value[layeridStack.value.length - 1]
    const layer = findLayer(lastid)
    if (!layer)
      return null
    return layer
  }
  else {
    return null
  }
})

onMounted(() => {
  nextTick(() => {
    watch(
      [currentCtx, currentToolConfig],
      ([ctx, config]) => {
        if (!ctx)
          return
        if (
          currentToolConfig.value.tool === Tool.pencil
          || currentToolConfig.value.tool === Tool.eraser
          || currentToolConfig.value.tool === Tool.line
        ) {
          ctx.strokeStyle = config.strokecolor
          ctx.fillStyle = config.strokecolor
          ctx.lineWidth = config.linewidth
        }
        else if (
          currentToolConfig.value.tool === Tool.rectangle
          || currentToolConfig.value.tool === Tool.ellipse
        ) {
          ctx.strokeStyle = config.strokecolor
          ctx.fillStyle = config.fillcolor
          ctx.lineWidth = config.linewidth
        }
      },
      { immediate: true, deep: true },
    )
  })
})

onMounted(() => {
  addLayer()
  nextTick(() => {
    initTools()
    initCursor()
    initScroll()
    initPressure()
    initLang()
  })
})

function setCanvasRef(el: any) {
  if (el) {
    if (canvasRefs.value.includes(el))
      return
    canvasRefs.value.push(el as HTMLCanvasElement)
  }
}

function findLayer(layerid: string): Layer | null {
  for (const layer of layers.value) {
    if (layer.id === layerid)
      return layer
  }
  return null
}

function addLayer() {
  if (!layers.value)
    return
  const id = nanoid()
  const newlayer: Layer = {
    id,
    canvas: null,
    context: null,
    imageStack: [],
    name: `${t('layer')}${++totalNum}`,
  }
  layers.value.push(newlayer)
  nextTick(() => {
    newlayer.canvas = canvasRefs.value[canvasRefs.value.length - 1]
    newlayer.context = canvasRefs.value[canvasRefs.value.length - 1].getContext('2d')
    currentLayer.value = newlayer
    // console.log(layers);
  })
}
function deleteLayer() {
  if (!layers.value)
    return
  const index = layers.value.findIndex(val => val.id === currentLayer.value?.id)
  if (index >= 0) {
    layers.value.splice(index, 1)
    changeLayer(layers.value[layers.value.length - 1].id)
  }
}
function changeLayer(layerid: string) {
  const layer = findLayer(layerid)
  if (!layer)
    return
  currentLayer.value = layer
}

function changeTool(type: Tool) {
  currentToolConfig.value.tool = type
}
function initTools() {
  /**
   * 取出栈顶的图像（但不弹出），将其绘制到canvas上
   */
  if (!currentCtx.value || !currentLayer.value || !canvasContainerRef.value)
    throw new Error('initiate tools error')
  const revert = () => {
    if (!lastLayer.value)
      return
    const imageStack = lastLayer.value.imageStack
    if (imageStack.length > 0) {
      const image = imageStack[imageStack.length - 1]!
      drawImageData(lastLayer.value.canvas, image)
    }
  }
  const pencil = usePencil(revert)
  const eraser = useEraser(revert)
  const line = useLine(revert)
  const rectangle = useRectangle(revert)
  const ellipse = useEllipse(revert)

  // const circle = useLine(currentCtx, revert)
  const getcurrentToolEvents: () => ToolEventsObject = () => {
    if (currentToolConfig.value.tool === Tool.pencil)
      return pencil
    else if (currentToolConfig.value.tool === Tool.eraser)
      return eraser
    else if (currentToolConfig.value.tool === Tool.line)
      return line
    else if (currentToolConfig.value.tool === Tool.rectangle)
      return rectangle
    else if (currentToolConfig.value.tool === Tool.ellipse)
      return ellipse
    else
      return pencil
  }
  const onMousedown = (e: MouseEvent) => {
    e.preventDefault()
    if (!currentLayer.value || !currentCtx.value)
      return
    layeridStack.value.push(currentLayer.value.id)
    pushImage(currentLayer.value.id, getImageData(currentLayer.value.canvas))
    getcurrentToolEvents().onMousedown!(currentCtx.value, window2canvas(currentLayer.value.canvas!, e.clientX, e.clientY))
  }
  const onMousemove = (e: MouseEvent) => {
    e.preventDefault()
    if (!currentLayer.value || !currentCtx.value)
      return
    if (getcurrentToolEvents().onMousemove)
      getcurrentToolEvents().onMousemove!(currentCtx.value, window2canvas(currentLayer.value.canvas!, e.clientX, e.clientY))
  }
  const onMouseup = (e: MouseEvent) => {
    e.preventDefault()
    if (!currentLayer.value || !currentCtx.value)
      return
    if (getcurrentToolEvents().onMouseup)
      getcurrentToolEvents().onMouseup!(currentCtx.value, window2canvas(currentLayer.value.canvas!, e.clientX, e.clientY))
    if (props.pressure)
      currentToolConfig.value.linewidth = props.minLine
  }
  const onMouseleave = (e: MouseEvent) => {
    e.preventDefault()
    if (!currentLayer.value || !currentCtx.value)
      return
    if (getcurrentToolEvents().onMouseleave)
      getcurrentToolEvents().onMouseleave!(currentCtx.value, window2canvas(currentLayer.value.canvas!, e.clientX, e.clientY))
  }
  const onTouchstart = (e: TouchEvent) => {
    e.preventDefault()
    if (!currentLayer.value || !currentCtx.value)
      return
    if (getcurrentToolEvents().onTouchstart)
      getcurrentToolEvents().onTouchstart!(currentCtx.value, window2canvas(currentLayer.value.canvas!, e.touches[0].clientX, e.touches[0].clientY))
  }
  const onTouchmove = (e: TouchEvent) => {
    e.preventDefault()
    if (!currentLayer.value || !currentCtx.value)
      return
    if (getcurrentToolEvents().onTouchmove)
      getcurrentToolEvents().onTouchmove!(currentCtx.value, window2canvas(currentLayer.value.canvas!, e.touches[0].clientX, e.touches[0].clientY))
  }
  const onTouchend = (e: TouchEvent) => {
    e.preventDefault()
    if (!currentLayer.value || !currentCtx.value)
      return
    if (getcurrentToolEvents().onTouchend)
      getcurrentToolEvents().onTouchend!(currentCtx.value, window2canvas(currentLayer.value.canvas!, 0, 0))
  }
  canvasContainerRef.value!.addEventListener('mousedown', onMousedown)
  canvasContainerRef.value!.addEventListener('mousemove', onMousemove)
  canvasContainerRef.value!.addEventListener('mouseup', onMouseup)
  canvasContainerRef.value!.addEventListener('mouseleave', onMouseleave)
  canvasContainerRef.value!.addEventListener('touchstart', onTouchstart)
  canvasContainerRef.value!.addEventListener('touchmove', onTouchmove)
  canvasContainerRef.value!.addEventListener('touchend', onTouchend)
}

function initCursor() {
  const ctx = cursorRef.value!.getContext('2d')
  if (!ctx)
    return
  const onMousemove = (e: MouseEvent) => {
    const mx = e.offsetX - ctx.canvas!.offsetLeft
    const my = e.offsetY - ctx.canvas!.offsetTop
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.beginPath()
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 0.5
    ctx.arc(mx, my, currentToolConfig.value.maxwidth / 2, 0, Math.PI * 2)
    ctx.stroke()
    ctx.closePath()
  }
  const onMouseleave = (e: MouseEvent) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }
  canvasContainerRef.value!.addEventListener(
    'mousemove',
    useThrottleFn(onMousemove, PencilConfig.delay),
  )
  canvasContainerRef.value!.addEventListener('mouseleave', onMouseleave)
}

function initScroll() {
  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    if (event.deltaY >= 0 && currentToolConfig.value.maxwidth > props.minLine)
      currentToolConfig.value.maxwidth -= Math.abs(Math.round(event.deltaY / 100) * 5)
    else if (event.deltaY < 0 && currentToolConfig.value.maxwidth < props.maxLine)
      currentToolConfig.value.maxwidth += Math.abs(Math.round(event.deltaY / 100) * 5)
  }
  canvasContainerRef.value!.addEventListener('wheel', onWheel)
}

function initPressure() {
  Pressure.set('#canvasContainer', {
    change(force: any) {
      if (props.pressure) {
        currentToolConfig.value.linewidth = Math.round(
          force * currentToolConfig.value.maxwidth,
        )
      }
      else {
        currentToolConfig.value.linewidth = currentToolConfig.value.maxwidth
      }
    },
  })
}

function initLang() {
  if (availableLocales.includes(props.lang))
    locale.value = props.lang
}

function clearCtx(context: CanvasRenderingContext2D | HTMLCanvasElement | null) {
  if (!context)
    return
  if (layeridStack.value.length > 0) {
    layeridStack.value.push(currentLayer.value!.id)
    pushImage(currentLayer.value!.id, getImageData(currentLayer.value!.canvas))
  }
  if (context instanceof CanvasRenderingContext2D) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
  }
  else {
    const ctx = context.getContext('2d')
    if (!ctx)
      return null
    ctx.clearRect(0, 0, context.width, context.height)
  }
}

function pushImage(layerid: string, data: ImageData | null) {
  if (!data)
    return

  const layer = findLayer(layerid)
  if (!layer)
    return
  layer.imageStack.push(data)
}

function drawImageData(
  context: CanvasRenderingContext2D | HTMLCanvasElement | null,
  data: ImageData | null,
) {
  if (!context || !data)
    return
  if (context instanceof CanvasRenderingContext2D) {
    context.putImageData(data, 0, 0)
  }
  else {
    const ctx = context.getContext('2d')
    if (!ctx)
      return null
    ctx.putImageData(data, 0, 0)
  }
}

function getImageData(
  context: CanvasRenderingContext2D | HTMLCanvasElement | null,
): ImageData | null {
  if (!context)
    return null
  if (context instanceof CanvasRenderingContext2D) {
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height)
  }
  else {
    const ctx = context.getContext('2d')
    if (!ctx)
      return null
    return ctx.getImageData(0, 0, context.width, context.height)
  }
}

function goPrevious() {
  if (!lastLayer.value)
    return
  const imageStack = lastLayer.value.imageStack
  if (imageStack.length > 0) {
    const image = imageStack.pop()!
    drawImageData(lastLayer.value.canvas, image)
  }
  layeridStack.value.pop()
}

function saveImage() {
  const ctx = imageRef.value!.getContext('2d')
  if (ctx) {
    layers.value.forEach((layer) => {
      // const pic = layer.context!.getImageData(0, 0, layer.canvas!.width, layer.canvas!.height)
      // if (pic) {
      //   ctx!.putImageData(pic, 0, 0)
      // }
      ctx!.drawImage(layer.canvas!, 0, 0)
    })
    const image = document.createElement('a')
    image.download = 'picture.png'
    image.href = imageRef.value!.toDataURL() || ''
    image.click()
  }
}
</script>

<template>
  <div class="flex">
    <!-- Main content -->
    <div
      id="canvasContainer"
      ref="canvasContainerRef"
      class="relative cursor-none flex-none"
    >
      <canvas
        ref="cursorRef"
        :width="width"
        :height="height"
        class="absolute top-0"
      />
      <canvas
        v-for="layer in layers"
        :ref="setCanvasRef"
        :key="layer.id"
        class="absolute top-0"
        :width="width"
        :height="height"
      />
      <canvas ref="imageRef" :width="width" :height="height" />
    </div>
    <div class="flex-0 px-1 bg-gray-100 rounded-lg ml-2">
      <div class="my-2 flex flex-col">
        <button style="margin-left: 12px" @click="changeTool(Tool.pencil)">
          {{ t("pencil") }}
        </button>
        <button @click="changeTool(Tool.eraser)">
          {{ t("eraser") }}
        </button>
        <button @click="changeTool(Tool.line)">
          {{ t("line") }}
        </button>
        <button @click="changeTool(Tool.rectangle)">
          {{ t("rectangle") }}
        </button>
        <button @click="changeTool(Tool.ellipse)">
          {{ t("ellipse") }}
        </button>
        <button @click="addLayer">
          {{ t("addL") }}
        </button>
        <button :disabled="layers.length <= 1" @click="deleteLayer">
          {{ t("rmL") }}
        </button>
        <button @click="clearCtx(currentCtx)">
          {{ t("cls") }}
        </button>
        <button :disabled="layeridStack.length <= 0" @click="goPrevious">
          {{ t("pre") }}
        </button>
        <button @click="saveImage">
          {{ t("save") }}
        </button>
      </div>
      <div class="my-2 text-base flex justify-evenly">
        <span :style="{ color: currentToolConfig.strokecolor }">
          {{ t("scolor") }}:
          <el-color-picker
            v-model="currentToolConfig.strokecolor"
            :predefine="predefineColors"
          />
        </span>
        <span :style="{ color: currentToolConfig.fillcolor }">
          {{ t("fcolor") }}:
          <el-color-picker
            v-model="currentToolConfig.fillcolor"
            show-alpha
            :predefine="predefineColors"
          />
        </span>
      </div>
      <div class="px-3">
        <el-slider
          v-model="currentToolConfig.maxwidth"
          show-input
          :min="minLine"
          :max="maxLine"
          :step="1"
        />
      </div>
      <div class="my-2 text-lg text-gray-700 text-center">
        <span class="font-bold"> {{ t("clayer") }}: </span>
        <span>{{ currentLayer?.name }}</span>
        <span class="font-bold"> {{ t("layern") }}: </span>
        <span>{{ canvasRefs.length }}</span>
      </div>
      <div>
        <draggable
          v-model="layers"
          item-key="id"
          ghost-class="ghost"
          class="flex flex-col"
          @start="isDragging = true"
          @end="isDragging = false"
        >
          <template #item="{ element }">
            <button @click="changeLayer(element.id)">
              {{ element.name }}
            </button>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
