import { computed } from "vue"

import { isCameraActive } from "./camera"
import { isDrawingCanvasOpen } from "./drawing"

export const isFullscreenWidgetOpen = computed(
  () => isCameraActive.value || isDrawingCanvasOpen.value,
)
