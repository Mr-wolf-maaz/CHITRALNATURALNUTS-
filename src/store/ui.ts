"use client";

import { create } from "zustand";

export type Toast = { id: number; message: string; tone: "success" | "info" | "error" };

type UiState = {
  cartOpen: boolean;
  checkoutOpen: boolean;
  lastOrderId: string | null;
  toasts: Toast[];
  setCartOpen: (v: boolean) => void;
  setCheckoutOpen: (v: boolean) => void;
  setLastOrderId: (v: string | null) => void;
  toast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
};

let toastId = 0;

export const useUi = create<UiState>((set, get) => ({
  cartOpen: false,
  checkoutOpen: false,
  lastOrderId: null,
  toasts: [],
  setCartOpen: (v) => set({ cartOpen: v }),
  setCheckoutOpen: (v) => set({ checkoutOpen: v }),
  setLastOrderId: (v) => set({ lastOrderId: v }),
  toast: (message, tone = "success") => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { id, message, tone }] });
    setTimeout(() => get().dismissToast(id), 2600);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
