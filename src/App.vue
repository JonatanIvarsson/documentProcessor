<template>
  <main>
    <DocumentUpload />
  </main>
</template>

<script lang="ts">
import DocumentUpload from '@/components/DocumentUpload.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  components: { DocumentUpload },
})
</script>

<style scoped lang="scss">
h1 {
  text-align: center;
  font-weight: 500;
  font-size: 3rem;
  border-radius: 1rem;
}
</style>
