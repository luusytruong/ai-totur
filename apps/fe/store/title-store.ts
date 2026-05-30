"use client"

import { create } from "zustand"

interface TitleState {
  title: string
  setTitle: (title: string) => void
}

export const titleStore = create<TitleState>((set) => ({
  title: "Tổng quan",
  setTitle: (title: string) => set({ title }),
}))
