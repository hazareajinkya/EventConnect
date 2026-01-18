import { create } from 'zustand';

export type FaceBox = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  personName?: string;
  personTitle?: string;
  linkedinUrl?: string;
};

interface AppState {
  imageUrl: string | null;
  faces: FaceBox[];
  activeFaceId: string | null;
  isScannerRunning: boolean;
  
  setImageUrl: (url: string) => void;
  setFaces: (faces: FaceBox[]) => void;
  updateFace: (id: string, data: Partial<FaceBox>) => void;
  setActiveFace: (id: string | null) => void;
  setScannerRunning: (isRunning: boolean) => void;
  addFace: (face: FaceBox) => void;
  removeFace: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  imageUrl: null,
  faces: [],
  activeFaceId: null,
  isScannerRunning: false,

  setImageUrl: (url) => set({ imageUrl: url }),
  setFaces: (faces) => set({ faces }),
  updateFace: (id, data) => set((state) => ({
    faces: state.faces.map((f) => (f.id === id ? { ...f, ...data } : f)),
  })),
  setActiveFace: (id) => set({ activeFaceId: id }),
  setScannerRunning: (isRunning) => set({ isScannerRunning: isRunning }),
  addFace: (face) => set((state) => ({ faces: [...state.faces, face] })),
  removeFace: (id) => set((state) => ({ faces: state.faces.filter((f) => f.id !== id) })),
}));
