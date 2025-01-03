<script lang="ts" setup>
import { ref, onMounted } from "vue"
import VueDrawingCanvas from "vue-drawing-canvas"

import { drawingCanvasImage } from "@/composables/drawing"

const VueCanvasDrawing = ref<InstanceType<typeof VueDrawingCanvas> | null>(null)

const initialImage = ref([
  {
    type: "dash",
    from: {
      x: 262,
      y: 154,
    },
    coordinates: [],
    color: "#000000",
    width: 5,
    fill: false,
  },
])
const x = ref(0)
const y = ref(0)
const eraser = ref(false)
const disabled = ref(false)
const fillShape = ref(false)
const line = ref(5)
const color = ref("#000000")
const strokeType = ref("dash")
const lineCap = ref("round")
const lineJoin = ref("round")
const backgroundColor = ref("#FFFFFF")
const backgroundImage = ref<string | undefined>(undefined)
const additionalImages = ref<any[]>([])

onMounted(() => {
  if ("vue-drawing-canvas" in window.localStorage) {
    initialImage.value = JSON.parse(
      window.localStorage.getItem("vue-drawing-canvas") || "[]",
    )
  }
})

const getCoordinate = (event: MouseEvent) => {
  if (VueCanvasDrawing.value) {
    const coordinates = VueCanvasDrawing.value.getCoordinates(event)
    x.value = coordinates.x
    y.value = coordinates.y
  }
}
</script>

<template>
  <div class="flex justify-center items-center select-none">
    <vue-drawing-canvas
      ref="VueCanvasDrawing"
      v-model:image="drawingCanvasImage"
      :width="500"
      :height="500"
      :stroke-type="strokeType"
      :line-cap="lineCap"
      :line-join="lineJoin"
      :fill-shape="fillShape"
      :eraser="eraser"
      :lineWidth="line"
      :color="color"
      :background-color="backgroundColor"
      :background-image="backgroundImage"
      saveAs="png"
      :styles="{
        border: 'solid 1px #000',
        'user-select': 'none',
      }"
      :lock="disabled"
      @mousemove="getCoordinate($event)"
      :additional-images="additionalImages"
    />
  </div>
</template>
