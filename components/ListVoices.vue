<script lang="ts" setup>
const voices = window.speechSynthesis.getVoices()

const cnVoices = voices.filter((voice) => voice.lang.includes("zh-CN"))
</script>

<template>
  <div v-for="voice in cnVoices" class="flex text-white">
    <div>{{ voice.voiceURI }}</div>
  </div>
</template>
