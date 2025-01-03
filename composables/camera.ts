const isAndroid = navigator.userAgent.toLowerCase().includes("android")

export const useNativeFilePicker = useState(
  "useNativeFilePicker",
  () => !isAndroid,
)

export const isCameraActive = useState("isCameraActive", () => false)
