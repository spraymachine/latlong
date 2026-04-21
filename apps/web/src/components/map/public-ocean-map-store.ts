import { create } from "zustand"

type PublicOceanSceneState = {
  focusedVoyageId: string | null
  selectedSignalId: string | null
  setFocusedVoyageId: (voyageId: string | null) => void
  setSelectedSignalId: (signalId: string | null) => void
}

export const usePublicOceanSceneStore = create<PublicOceanSceneState>((set) => ({
  focusedVoyageId: null,
  selectedSignalId: null,
  setFocusedVoyageId: (focusedVoyageId) => set({ focusedVoyageId }),
  setSelectedSignalId: (selectedSignalId) => set({ selectedSignalId }),
}))
