import { create } from 'zustand';
import { Simulation } from '@/types';

interface SimulationStore {
  // State
  simulations: Simulation[];
  activeSimulation: Simulation | null;
  comparisonList: string[];

  // Actions
  addSimulation: (simulation: Simulation) => void;
  updateSimulation: (id: string, simulation: Partial<Simulation>) => void;
  deleteSimulation: (id: string) => void;
  setActiveSimulation: (id: string | null) => void;
  toggleComparison: (id: string) => void;
  clearComparisonList: () => void;

  // Computed
  getSimulationById: (id: string) => Simulation | undefined;
  getComparisonSimulations: () => Simulation[];
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  simulations: [],
  activeSimulation: null,
  comparisonList: [],

  // Actions
  addSimulation: (simulation) =>
    set((state) => ({
      simulations: [...state.simulations, simulation],
      activeSimulation: simulation,
    })),

  updateSimulation: (id, updatedData) =>
    set((state) => ({
      simulations: state.simulations.map((sim) =>
        sim.id === id ? { ...sim, ...updatedData, updatedAt: new Date() } : sim
      ),
      activeSimulation:
        state.activeSimulation?.id === id
          ? { ...state.activeSimulation, ...updatedData, updatedAt: new Date() }
          : state.activeSimulation,
    })),

  deleteSimulation: (id) =>
    set((state) => ({
      simulations: state.simulations.filter((sim) => sim.id !== id),
      activeSimulation: state.activeSimulation?.id === id ? null : state.activeSimulation,
      comparisonList: state.comparisonList.filter((simId) => simId !== id),
    })),

  setActiveSimulation: (id) =>
    set((state) => ({
      activeSimulation: id ? state.simulations.find((sim) => sim.id === id) || null : null,
    })),

  toggleComparison: (id) =>
    set((state) => ({
      comparisonList: state.comparisonList.includes(id)
        ? state.comparisonList.filter((simId) => simId !== id)
        : [...state.comparisonList, id],
    })),

  clearComparisonList: () =>
    set(() => ({
      comparisonList: [],
    })),

  // Computed
  getSimulationById: (id) => {
    return get().simulations.find((sim) => sim.id === id);
  },

  getComparisonSimulations: () => {
    const state = get();
    return state.simulations.filter((sim) => state.comparisonList.includes(sim.id));
  },
}));