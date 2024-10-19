import { snackbarStore } from '@/stores/snackbarStore'

export async function doErrorHandling(operation: () => Promise<void>, operationDescription: string) {
  try {
    await operation()
  } catch (error) {
    if (error instanceof Error) {
      snackbarStore.showWarningMessage(error.message)
    } else {
      snackbarStore.showCriticalErrorMessage("An unknown error occurred while " + operationDescription)
    }
    return
  }
}