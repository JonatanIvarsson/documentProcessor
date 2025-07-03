<template>
  <div class="documents">
    <div class="upload">
      <div class="title">Upload Your Files</div>
      <p class="subtitle">Supports PDF documents</p>
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
        <span v-if="!activeTask()" class="nothing-selected">No files selected</span>
      </div>
    </div>

    <div class="files">
      <div v-for="task in activeUploadTasks" :key="task.id">
        <FileInformation :fileMetaData="task" :result="task.ocrResult" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { uploadFile, getActiveUploadTasks, emitter } from '@/firebase/functions'
import FileInformation from './FileInformation.vue'
import type FileUploadTask from '@/interfaces/FileUploadTask.ts'

export default defineComponent({
  name: 'DocumentUpload',
  components: {
    FileInformation,
  },
  data() {
    return {
      activeUploadTasks: [] as FileUploadTask[],
    }
  },
  methods: {
    async onFileInput(event: Event) {
      const target = event.target as HTMLInputElement
      const files = target.files

      if (!files || files.length === 0) {
        return
      }

      for (let i = 0; i < files.length; i++) {
        uploadFile(files[i], 'uploads/documents/')
      }

      target.value = null;
    },
    activeTask() {
      return this.activeUploadTasks.length > 0
    },
  },
  mounted() {
    this.activeUploadTasks = getActiveUploadTasks()

    emitter.on('active-tasks-changed', (updatedTasks: FileUploadTask[]) => {
      this.activeUploadTasks = updatedTasks
    })
  },
  beforeUnmount() {
    emitter.off('active-tasks-changed')
  },
})
</script>

<style lang="scss" scoped>
@mixin align-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.documents {
  @include align-center;
  gap: 2rem;
  padding: 1rem;
  min-height: calc(100vh - 4rem);
}

.upload {
  @include align-center;
  padding: 2rem 10rem;
  text-align: center;
  border: 2px dashed var(--vt-c-divider-dark-2);
  border-radius: 12px;
  background-color: var(--vt-c-black-mute);
  box-shadow: 0 4px 15px var(--color-shadow-dark);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 6px 20px var(--color-shadow-darker);
  }

  .title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--color-accent-vue-green);
    margin-bottom: 0.5rem;
  }

  .subtitle,
  .nothing-selected {
    color: var(--vt-c-text-dark-2);
  }

  .subtitle {
    margin-bottom: 1.5rem;
  }
  .nothing-selected {
    font-size: 0.9rem;
  }
  input[type='file'] {
    display: none;
  }

  .button {
    @include align-center;
    gap: 1rem;
  }

  label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    font-weight: 600;
    color: var(--vt-c-text-dark-1);
    background-color: var(--color-accent-vue-green-dark);
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--color-accent-vue-green);
    }

    img {
      width: 24px;
      height: 24px;
    }
  }
}

.files {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1600px;
}
</style>
