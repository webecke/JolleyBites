import { reactive } from 'vue'

interface SnackbarState {
  show: boolean
  message: string
  color: string
  timeout: number
  multiLine: boolean
  vertical: boolean
}

const state = reactive<SnackbarState>({
  show: false,
  message: '',
  color: '',
  timeout: 3000,
  multiLine: false,
  vertical: false,
})

export const snackbarStore = {
  state,
  showMessage(message: string, options?: Partial<SnackbarState>) {
    state.show = false
    state.message = message
    state.show = true
    Object.assign(state, options)
  },
  showSuccessMessage(message: string) {
    this.showMessage(message, {color: "green", timeout: 5000})
  },
  showWarningMessage(message: string) {
    this.showMessage(message, {color: "yellow", timeout: 10000})
  },
  showCriticalErrorMessage(message: string) {
    this.showMessage(message, {color: "error", timeout: -1})
  },
  showTempInfoMessage(message: string) {
    this.showMessage(message, {color: "grey", timeout: 2500})
  },
  showPersistentInfoMessage(message: string) {
    this.showMessage(message, {color: "grey", timeout: -1})
  },
  hideMessage() {
    state.show = false
  },
}