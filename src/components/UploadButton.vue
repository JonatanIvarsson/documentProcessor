<template>
  <div class="button">
    <label for="file-upload">
      <img src="/src/assets/icons/uploadCloud.svg" />
      <span>
            {{ !activeTask() ? 'Choose Files' : 'Upload More Files' }}
          </span>
    </label>
    <input
      id="file-upload"
      accept="application/pdf"
      type="file"
      @change="onFileInput"
      multiple
    />
    <span class="nothing-selected">No files selected</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UploadButton',
})
</script>

<style scoped lang="scss">

</style>
