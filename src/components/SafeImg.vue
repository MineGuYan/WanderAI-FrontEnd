<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
});

const isValid = ref(true);

const handleError = () => {
  isValid.value = false;
};

const handleLoad = () => {
  isValid.value = true;
};

// 监听 src 变化，重置状态
watch(() => props.url, () => {
  isValid.value = true;
});
</script>

<template>
   <img
    v-if="isValid"
    :src="url"
    @error="handleError"
    @load="handleLoad"
    alt=""
   />
</template>

<style scoped>

</style>