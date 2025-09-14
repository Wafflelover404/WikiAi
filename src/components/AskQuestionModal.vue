<template>
  <div v-if="visible">
    <div class="modal-backdrop" @click="$emit('close')"></div>
    <div class="ask-modal">
      <div class="modal-content" tabindex="0">
        <h3>Ask a Question</h3>
        <p class="subtitle">Submit your question to the reports inbox. An admin will review and respond.</p>
        <textarea
          v-model="questionText"
          class="question-input"
          rows="6"
          placeholder="Type your question here..."
          :disabled="submitting"
        ></textarea>
        <div class="helper">Include context, expected answer, or where you looked.</div>
        <div class="modal-actions">
          <button class="primary" :disabled="!canSubmit || submitting" @click="submitQuestion">
            {{ submitting ? 'Submitting...' : 'Submit' }}
          </button>
          <button class="secondary" :disabled="submitting" @click="$emit('close')">Cancel</button>
        </div>
        <div v-if="message" class="status" :class="{ error: isError, success: !isError }">{{ message }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AskQuestionModal',
  props: {
    visible: { type: Boolean, default: false },
    token: { type: String, required: true },
    serverUrl: { type: String, required: true }
  },
  data() {
    return {
      questionText: '',
      submitting: false,
      message: '',
      isError: false
    };
  },
  computed: {
    canSubmit() {
      return this.questionText.trim().length > 2 && !!this.token && !!this.serverUrl;
    }
  },
  methods: {
    async submitQuestion() {
      if (!this.canSubmit || this.submitting) return;
      this.submitting = true;
      this.message = '';
      this.isError = false;
      try {
        const { submitManualReport } = await import('../api.js');
        const res = await submitManualReport({
          serverUrl: this.serverUrl,
          token: this.token,
          issue: this.questionText.trim()
        });
        if (res && res.status === 'success') {
          this.message = 'Your question was submitted successfully.';
          this.isError = false;
          this.$emit('submitted');
          setTimeout(() => this.$emit('close'), 900);
        } else {
          this.message = (res && (res.message || res.detail)) || 'Failed to submit your question.';
          this.isError = true;
        }
      } catch (e) {
        this.message = e.message || 'Failed to submit your question.';
        this.isError = true;
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 999;
}
.ask-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  animation: fadeIn 0.15s ease-out;
  /* Add safe padding to avoid edge collisions on small screens */
  padding: 12px;
}
.modal-content {
  background: #fff;
  border-radius: 14px;
  padding: 22px 20px 18px 20px;
  width: min(560px, 92vw);
  box-shadow: 0 10px 36px rgba(0,0,0,0.18);
  outline: none;
  box-sizing: border-box; /* Prevent overflow from padding */
}
.dark-mode .modal-content {
  background: #1f2122;
  color: #e0e0e0;
  box-shadow: 0 10px 36px rgba(0,0,0,0.6);
}
.modal-content h3 {
  margin: 0 0 6px 0;
}
.subtitle {
  margin: 0 0 14px 0;
  color: #5f6368;
  font-size: 14px;
}
.dark-mode .subtitle { color: #a0a6ac; }
.question-input {
  width: 100%;
  border: 1px solid #dfe1e5;
  border-radius: 8px;
  padding: 10px 12px;
  resize: vertical;
  font-size: 14px;
  max-width: 100%;
  box-sizing: border-box; /* Include padding/border in width calc */
  overflow-wrap: anywhere; /* Avoid horizontal overflow on long text */
}
.dark-mode .question-input {
  background: #232628;
  border-color: #3a3d3f;
  color: #e0e0e0;
}
.helper {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
}
.dark-mode .helper { color: #9aa0a6; }
.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
button.primary {
  background: #4285f4;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 600;
  cursor: pointer;
}
button.primary:disabled { opacity: 0.6; cursor: not-allowed; }
button.secondary {
  background: #e8eaed;
  color: #202124;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
}
.dark-mode button.secondary {
  background: #2a2d2f;
  color: #e0e0e0;
}
.status {
  margin-top: 10px;
  font-size: 13px;
}
.status.success { color: #1e8e3e; }
.status.error { color: #d93025; }
.dark-mode .status.success { color: #81c784; }
.dark-mode .status.error { color: #ef9a9a; }
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

/* Mobile adjustments */
@media (max-width: 480px) {
  .modal-content {
    padding: 16px 14px;
    width: 94vw;
  }
  .question-input {
    font-size: 13px;
  }
  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
