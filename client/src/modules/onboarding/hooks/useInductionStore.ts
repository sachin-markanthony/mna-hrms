import { useSyncExternalStore } from 'react';
import { inductionStore } from '../store/inductionStore';

/**
 * Subscribes the component to the local induction store.
 * Every chapter completion, quiz attempt or notification change triggers a re-render,
 * which keeps the training portal and the main dashboard in sync automatically.
 */
export function useInductionSnapshot() {
  return useSyncExternalStore(
    inductionStore.subscribe,
    inductionStore.getSnapshot,
    inductionStore.getSnapshot,
  );
}

export function useTrainingSummary() {
  return useInductionSnapshot().summary;
}
