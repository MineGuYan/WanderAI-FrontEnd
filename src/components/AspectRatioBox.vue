<template>
  <div  ref="container" class="content" :style="contentStyle">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    aspectRatio: {
      type: Number,
      default: 16/9
    },
    widthPercentage: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      width: 0
    }
  },
  computed: {
    contentStyle() {
      return {
        width: `${this.widthPercentage}%`,
        height: `${this.width / this.aspectRatio}px`
      }
    }
  },
  mounted() {
    this.updateSize()
    window.addEventListener('resize', this.updateSize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateSize)
  },
  methods: {
    updateSize() {
      this.width = this.$refs.container.clientWidth
      this.height = this.width / this.aspectRatio
    }
  }
}
</script>

<style scoped>

.content {
  position: relative;
}
</style>