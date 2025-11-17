import * as React from 'react';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

type Toast = ToastProps & {
  id: string;
};

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = {
  type: 'ADD_TOAST' | 'UPDATE_TOAST' | 'DISMISS_TOAST' | 'REMOVE_TOAST';
  toast?: Partial<Toast>;
};

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toast: { id: toastId },
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: Toast[], action: ActionType): Toast[] => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [action.toast as Toast, ...state].slice(0, TOAST_LIMIT);

    case 'UPDATE_TOAST':
      return state.map((t) =>
        t.id === action.toast?.id ? { ...t, ...action.toast } : t
      );

    case 'DISMISS_TOAST': {
      const { toast } = action;

      if (toast) {
        addToRemoveQueue(toast.id!);
      } else {
        state.forEach((t) => {
          addToRemoveQueue(t.id);
        });
      }

      return state.map((t) =>
        t.id === toast?.id || toast?.id === undefined
          ? {
              ...t,
              open: false,
            }
          : t
      );
    }
    case 'REMOVE_TOAST':
      if (action.toast?.id === undefined) {
        return [];
      }
      return state.filter((t) => t.id !== action.toast?.id);
  }
};

const listeners: Array<(state: Toast[]) => void> = [];

let memoryState: Toast[] = [];

function dispatch(action: ActionType) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function toast(props: ToastProps) {
  const id = genId();

  const update = (newProps: Partial<Toast>) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...newProps, id },
    });

  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toast: { id } });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    } as Toast,
  });

  return {
    id,
    dismiss,
    update,
  };
}

export function useToast() {
  const [state, setState] = React.useState<Toast[]>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    toast,
    toasts: state,
    dismiss: (toastId?: string) =>
      dispatch({ type: 'DISMISS_TOAST', toast: { id: toastId } }),
  };
}
