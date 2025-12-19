<template>
  <teleport to="body">
    <div v-if="visible" class="quiz-modal-overlay" @click.self="onClose" role="dialog" aria-modal="true">
      <div class="quiz-modal" role="document">
      <div class="quiz-header">
        <h3 class="quiz-title" :title="filename"><SvgIcons icon="notebook" /> Quiz: {{ filename }}</h3>
        <div class="quiz-actions">
          <button class="regen-btn" @click="regenerate" :disabled="loading"><SvgIcons icon="refresh" /> Regenerate</button>
          <button class="close-btn" @click="onClose">✕</button>
        </div>
      </div>

      <div class="quiz-body">
        <div v-if="loading" class="quiz-loading">Generating quiz...</div>
        <div v-else-if="error" class="quiz-error">{{ error }}</div>
        <div v-else-if="!quiz || !quiz.questions || quiz.questions.length === 0" class="quiz-empty">
          No quiz available for this file yet. Try regenerating.
        </div>
        <div v-else class="quiz-content">
          <div v-for="(q, idx) in quiz.questions" :key="idx" class="quiz-question">
            <div class="question-text">
              {{ idx + 1 }}. {{ q.question }}
            </div>
            <div class="options-list">
              <label v-for="(opt, oidx) in q.options" :key="oidx" class="option-item">
                <input type="radio" :name="'q' + idx" :value="opt" v-model="answers[idx]" />
                <span>{{ opt }}</span>
              </label>
            </div>
            <div v-if="submitted" class="answer-feedback" :class="{correct: isCorrect(idx), wrong: !isCorrect(idx)}">
              <span v-if="isCorrect(idx)"><SvgIcons icon="checkmark" /> Correct</span>
              <span v-else><SvgIcons icon="close" /> Wrong</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quiz-footer">
        <button class="submit-btn" @click="submit" :disabled="loading || submitted">Submit</button>
        <div v-if="submitted" class="score">Score: {{ score }}/{{ total }}</div>
      </div>
    </div>
  </div>
</teleport>
</template>

<script>
import SvgIcons from './SvgIcons.vue';

export default {
  name: 'QuizModal',
  components: {
    SvgIcons
  },
  props: {
    visible: { type: Boolean, default: false },
    filename: { type: String, required: true },
    token: { type: String, required: true },
    serverUrl: { type: String, required: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      quiz: null,
      answers: {},
      submitted: false,
    };
  },
  computed: {
    total() {
      return this.quiz && this.quiz.questions ? this.quiz.questions.length : 0;
    },
    score() {
      if (!this.submitted || !this.quiz || !this.quiz.questions) return 0;
      let s = 0;
      this.quiz.questions.forEach((q, idx) => {
        if (this.answers[idx] === q.answer) s++;
      });
      return s;
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadQuiz(false);
      } else {
        this.resetState();
      }
    },
    filename(newFilename, old) {
      if (this.visible && newFilename !== old) {
        this.loadQuiz(false);
      }
    }
  },
  methods: {
    resetState() {
      this.loading = false;
      this.error = '';
      this.quiz = null;
      this.answers = {};
      this.submitted = false;
    },
    async loadQuiz(regenerate) {
      this.loading = true;
      this.error = '';
      try {
        const url = `${this.serverUrl}/quiz/${encodeURIComponent(this.filename)}?regenerate=${regenerate ? 'true' : 'false'}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        const data = await res.json();
        if (data.status !== 'success') {
          throw new Error(data.message || 'Failed to load quiz');
        }
        // data.response.quiz is the quiz JSON object
        this.quiz = data.response.quiz || { questions: [] };
        // Normalize in case backend returned fenced JSON in raw
        this.normalizeQuiz();
        // Reset answers on reload
        this.answers = {};
        this.submitted = false;
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
    submit() {
      this.submitted = true;
    },
    isCorrect(idx) {
      if (!this.quiz || !this.quiz.questions) return false;
      return this.answers[idx] === this.quiz.questions[idx].answer;
    },
    async regenerate() {
      await this.loadQuiz(true);
    },
    normalizeQuiz() {
      try {
        if (!this.quiz) return;
        if (Array.isArray(this.quiz.questions) && this.quiz.questions.length > 0) return;
        if (typeof this.quiz.raw !== 'string') return;
        // Extract JSON from ```json ... ``` block or generic ``` ... ```
        const fencedJson = this.quiz.raw.match(/```json\s*([\s\S]*?)\s*```/i) || this.quiz.raw.match(/```[a-zA-Z]*\s*([\s\S]*?)\s*```/i);
        const jsonText = fencedJson ? fencedJson[1] : this.quiz.raw;
        const parsed = JSON.parse(jsonText);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          this.quiz.questions = parsed.questions;
        }
      } catch (e) {
        // silent fallback
      }
    },
    onClose() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.quiz-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.quiz-modal {
  width: min(800px, 95vw);
  max-height: 90vh;
  background: #fff;
  color: #1f2937;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
}
.dark-mode .quiz-modal {
  background: #1f2122;
  color: #e0e0e0;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
.quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}
.dark-mode .quiz-header {
  border-bottom-color: #333;
}
.quiz-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%; }
.quiz-actions button {
  margin-left: 8px;
}
.quiz-body {
  padding: 20px 20px 8px 20px;
  overflow: auto;
}
.quiz-question {
  margin-bottom: 16px;
  padding: 14px 14px 10px 14px;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  background: #ffffff;
}
.dark-mode .quiz-question {
  background: #232628;
  border-color: #33393d;
}
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.answer-feedback {
  margin-top: 8px;
}
.answer-feedback.correct { color: #2e7d32; }
.answer-feedback.wrong { color: #c62828; }
.dark-mode .answer-feedback.correct { color: #81c784; }
.dark-mode .answer-feedback.wrong { color: #ef9a9a; }
.quiz-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dark-mode .quiz-footer {
  border-top-color: #333;
}
.submit-btn, .regen-btn, .close-btn {
  background: #4a90e2;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s ease, transform .05s ease;
}
.submit-btn:hover, .regen-btn:hover, .close-btn:hover { filter: brightness(0.95); }
.submit-btn:active, .regen-btn:active, .close-btn:active { transform: translateY(1px); }
.close-btn { background: #9e9e9e; }
.regen-btn { background: #6a1b9a; }
.quiz-loading { color: #555; }
.quiz-error { color: #c62828; }
.dark-mode .quiz-loading { color: #c0c4c8; }
.dark-mode .quiz-error { color: #ef9a9a; }

</style>
