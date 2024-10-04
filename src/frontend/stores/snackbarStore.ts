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
  hideMessage() {
    state.show = false
  },
}