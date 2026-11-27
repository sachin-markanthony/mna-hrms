import { toast } from 'react-toastify';

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(err: unknown, fallback = 'Something went wrong') {
  const message = err instanceof Error ? err.message : typeof err === 'string' ? err : fallback;
  toast.error(message || fallback);
}
