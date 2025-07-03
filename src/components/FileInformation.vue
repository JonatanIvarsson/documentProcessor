<template>
  <div class="file-info">
    <div v-if="fileMetaData" class="card">
      <div class="section">
        <h3 class="header">File: {{ fileMetaData.name}}</h3>
        <div class="metadata">
          <div
            v-for="item in displayedMetadata()"
            :key="item.key"
            class="item"
            :class="{ 'full-width': item.isLongContent }"
          >
            <div class="label">{{ item.label }}</div>
            <div class="value">{{ item.value }}</div>
          </div>
        </div>
      </div>

      <div class="section status">
        <h3 class="header">Processing Status</h3>
        <div class="container">
          <div class="message" :class="fileMetaData.status">
            <span class="text">{{ getStatusMessage(fileMetaData.status) }}</span>
            <div v-if="showProgressBar()" class="progress">
              <div class="progress-bar" :style="{ width: `${fileMetaData?.progress}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="fileMetaData.ocrResult" class="section">
        <h3 class="header">Extracted Text</h3>
        <p class="extracted-text">{{ fileMetaData.ocrResult.text }}</p>
      </div>

      <div class="tags" v-if="fileMetaData.ocrResult">
      <span class="tag confidence">
        <span class="label">Confidence:</span> {{ fileMetaData.ocrResult.confidence}}
      </span>
        <span class="tag language">
        <span class="label">Language:</span> {{ fileMetaData.ocrResult.language }}
      </span>
      </div>
    </div>


    <div v-else class="no-result">No file or detection result available.</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { UploadStatus } from '@/enums/UploadStatus.ts'
import type FileUploadTask from '@/interfaces/FileUploadTask.ts'

export default defineComponent({
  name: 'FileInformation',
  props: {
    fileMetaData: {
      type: Object as PropType<FileUploadTask>,
      default: null
    },
    result: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
    }
  },
  methods: {
    displayedMetadata() {
      if (!this.fileMetaData) return []

      const items = []
      const file = this.fileMetaData.file

      const pdfData = this.fileMetaData.pdfMetadata || {}
      const allData = { ...file, ...pdfData }

      Object.entries(allData).forEach(([key, value]) => {
        if (value != null && value !== '') {
          let displayValue = value

          if (key === 'keywords' && Array.isArray(value)) {
            displayValue = value.join(', ')
          } else if (key === 'creationDate' || key === 'modDate') {
            displayValue = new Date(value).toUTCString();
          }

          const isLongContent = String(displayValue).length > 40

          items.push({
            key,
            label: this.capitalizeFirstLetter(key),
            value: displayValue,
            isLongContent
          })
        }
      })
      return items
    },
    showProgressBar() {
      return this.fileMetaData.status === UploadStatus.UPLOADING ||
        this.fileMetaData.status === UploadStatus.PAUSED;
    },
    capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
    },
    getStatusMessage(status: UploadStatus) {
      switch (status) {
        case UploadStatus.PENDING:
          return 'Queued for upload';
        case UploadStatus.UPLOADING:
          return 'Uploading';
        case UploadStatus.PAUSED:
          return 'Upload paused';
        case UploadStatus.UPLOADED:
          return 'Awaiting analysis';
        case UploadStatus.ERROR:
          return 'Upload failed';
        case UploadStatus.CANCELED:
          return 'Upload canceled';
        case UploadStatus.PROCESSING:
          return 'Analyzing document (OCR in progress)';
        case UploadStatus.COMPLETE:
          return 'Document analysis complete';
        case UploadStatus.RUNNING:
          return 'Processing...';
        default:
          return 'Awaiting file upload';
      }
    }
  },
});
</script>

<style scoped>
.file-info {
  border-radius: 12px;
  background-color: var(--vt-c-black-mute);
  box-shadow: 0 4px 15px rgba(0);
  transition: all 0.3s ease;
}

.card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.section {
  background-color: var(--vt-c-black-soft);
  border-radius: 8px;
  padding: 15px;
}

.header {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--color-accent-vue-green);
  margin-bottom: 15px;
  border-bottom: 1px solid var(--vt-c-divider-dark-2);
  padding-bottom: 5px;
}

.metadata {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 15px;
  align-items: start;

  .item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .full-width {
      grid-column: 1 / -1;
    }
  }
  .label {
    font-size: 0.8em;
    font-weight: 600;
    color: var(--color-accent-vue-green);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .value {
    font-size: 0.9em;
    color: var(--vt-c-text-dark-1);
    word-break: break-word;
    line-height: 1.4;
  }
}

.status {
  text-align: center;
  position: relative;

  .container {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
  }
  .message {
    font-size: 1em;
    font-weight: 500;
    padding: 10px 15px;
    text-align: center;
    word-break: break-word;
    position: relative;
    z-index: 2;
    min-height: 40px;
    background-color: var(--vt-c-black-soft);
    transition: all 0.3s ease;
    color: var(--vt-c-white);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pending,
  .paused,
  .uploading,
  .running {
    color: var(--color-status-info);
    background-color: var(--color-status-info-dark-bg);
  }

  .warning {
    color: var(--color-status-warning);
    background-color: var(--color-status-warning-dark-bg);
  }

  .error {
    color: var(--color-status-error);
    background-color: var(--color-status-error-dark-bg);
  }

  .complete {
    color: white;
    background-color: var(--color-accent-vue-green);
  }

  .processing {
    background: linear-gradient(
      90deg,
      var(--color-accent-vue-green-dark) 0%,
      var(--color-accent-vue-green) 25%,
      var(--color-accent-vue-green-light) 50%,
      var(--color-accent-vue-green) 75%,
      var(--color-accent-vue-green-dark) 100%
    );
    background-size: 400% 100%;
    animation: gradientMove 3s ease-in-out infinite;
    color: white;
  }

  .progress {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: var(--vt-c-black-soft);
    border-radius: 8px;
  }

  .progress-bar {
    height: 100%;
    background-color: var(--color-accent-vue-green-dark);
    transition: width 0.3s ease-out;
    border-radius: 8px;
  }
}

.extracted-text {
  font-size: 0.95em;
  color: var(--vt-c-text-dark-1);
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

.no-result {
  @include align-center();
  text-align: center;
  padding: 40px;
  color: var(--vt-c-text-dark-2);
  font-style: italic;
  height: 100%;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: auto;

  .tag {
    background-color: var(--vt-c-black-soft);
    border: 1px solid var(--vt-c-divider-dark-2);
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 0.85em;
    color: var(--vt-c-text-dark-1);
    display: inline-flex;
    align-items: center;
    gap: 5px;

    .label {
      font-weight: 600;
      color: var(--color-accent-vue-green);
    }
  }
}
</style>
