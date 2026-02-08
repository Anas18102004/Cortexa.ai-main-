import React, { createContext, useContext, useReducer, useCallback } from "react";
import type { 
  Signal, 
  Mission, 
  Response, 
  Commitment, 
  Outcome,
  FrictionItem,
  ResponseType 
} from "@/lib/models/types";

// ============================================
// State Types
// ============================================

interface WorkState {
  signals: Signal[];
  missions: Mission[];
  responses: Response[];
  commitments: Commitment[];
  outcomes: Outcome[];
  frictionItems: FrictionItem[];
  
  // UI State
  selectedSignalId: string | null;
  selectedMissionId: string | null;
  isFirstRun: boolean;
  isLoading: boolean;
}

// ============================================
// Actions
// ============================================

type WorkAction =
  | { type: "ADD_SIGNAL"; payload: Signal }
  | { type: "UPDATE_SIGNAL"; payload: { id: string; updates: Partial<Signal> } }
  | { type: "REMOVE_SIGNAL"; payload: string }
  | { type: "SET_SIGNALS"; payload: Signal[] }
  | { type: "ADD_MISSION"; payload: Mission }
  | { type: "UPDATE_MISSION"; payload: { id: string; updates: Partial<Mission> } }
  | { type: "ADD_RESPONSE"; payload: Response }
  | { type: "ADD_COMMITMENT"; payload: Commitment }
  | { type: "UPDATE_COMMITMENT"; payload: { id: string; updates: Partial<Commitment> } }
  | { type: "ADD_OUTCOME"; payload: Outcome }
  | { type: "ADD_FRICTION"; payload: FrictionItem }
  | { type: "RESOLVE_FRICTION"; payload: string }
  | { type: "SELECT_SIGNAL"; payload: string | null }
  | { type: "SELECT_MISSION"; payload: string | null }
  | { type: "SET_FIRST_RUN"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean };

// ============================================
// Reducer
// ============================================

function workReducer(state: WorkState, action: WorkAction): WorkState {
  switch (action.type) {
    case "ADD_SIGNAL":
      return { ...state, signals: [...state.signals, action.payload] };
    
    case "UPDATE_SIGNAL":
      return {
        ...state,
        signals: state.signals.map(s => 
          s.id === action.payload.id 
            ? { ...s, ...action.payload.updates, updatedAt: new Date() }
            : s
        ),
      };
    
    case "REMOVE_SIGNAL":
      return {
        ...state,
        signals: state.signals.filter(s => s.id !== action.payload),
      };
    
    case "SET_SIGNALS":
      return { ...state, signals: action.payload };
    
    case "ADD_MISSION":
      return { ...state, missions: [...state.missions, action.payload] };
    
    case "UPDATE_MISSION":
      return {
        ...state,
        missions: state.missions.map(m => 
          m.id === action.payload.id 
            ? { ...m, ...action.payload.updates, updatedAt: new Date() }
            : m
        ),
      };
    
    case "ADD_RESPONSE":
      // Also update the related signal's state
      const signalState: Signal["state"] = 
        action.payload.type === "ignore" ? "ignored" :
        action.payload.type === "defer" ? "deferred" :
        "responding";
      
      return {
        ...state,
        responses: [...state.responses, action.payload],
        signals: state.signals.map(s =>
          s.id === action.payload.signalId
            ? { ...s, state: signalState, updatedAt: new Date() }
            : s
        ),
      };
    
    case "ADD_COMMITMENT":
      return { ...state, commitments: [...state.commitments, action.payload] };
    
    case "UPDATE_COMMITMENT":
      return {
        ...state,
        commitments: state.commitments.map(c =>
          c.id === action.payload.id
            ? { ...c, ...action.payload.updates, updatedAt: new Date() }
            : c
        ),
      };
    
    case "ADD_OUTCOME":
      return { 
        ...state, 
        outcomes: [...state.outcomes, action.payload],
        responses: state.responses.map(r =>
          r.id === action.payload.responseId
            ? { ...r, outcomeId: action.payload.id }
            : r
        ),
      };
    
    case "ADD_FRICTION":
      return { ...state, frictionItems: [...state.frictionItems, action.payload] };
    
    case "RESOLVE_FRICTION":
      return {
        ...state,
        frictionItems: state.frictionItems.map(f =>
          f.id === action.payload
            ? { ...f, resolvedAt: new Date() }
            : f
        ),
      };
    
    case "SELECT_SIGNAL":
      return { ...state, selectedSignalId: action.payload };
    
    case "SELECT_MISSION":
      return { ...state, selectedMissionId: action.payload };
    
    case "SET_FIRST_RUN":
      return { ...state, isFirstRun: action.payload };
    
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
}

// ============================================
// Initial State
// ============================================

const initialState: WorkState = {
  signals: [],
  missions: [],
  responses: [],
  commitments: [],
  outcomes: [],
  frictionItems: [],
  selectedSignalId: null,
  selectedMissionId: null,
  isFirstRun: true,
  isLoading: false,
};

// ============================================
// Context
// ============================================

interface WorkContextType {
  state: WorkState;
  
  // Signal actions
  addSignal: (signal: Signal) => void;
  addSignals: (signals: Signal[]) => void;
  updateSignal: (id: string, updates: Partial<Signal>) => void;
  removeSignal: (id: string) => void;
  verifySignal: (id: string, status: Signal["verificationStatus"], notes?: string) => void;
  
  // Mission actions
  addMission: (mission: Mission) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  
  // Response actions
  respondToSignal: (
    signalId: string,
    responseType: ResponseType,
    justification: string,
    aiRecommendation: ResponseType,
    aiReasoning: string,
    aiConfidence: number
  ) => void;
  
  // Commitment actions
  addCommitment: (commitment: Commitment) => void;
  updateCommitment: (id: string, updates: Partial<Commitment>) => void;
  
  // Outcome actions
  recordOutcome: (outcome: Outcome) => void;
  
  // Friction actions
  addFriction: (friction: FrictionItem) => void;
  resolveFriction: (id: string) => void;
  
  // UI actions
  selectSignal: (id: string | null) => void;
  selectMission: (id: string | null) => void;
  setFirstRun: (isFirstRun: boolean) => void;
  
  // Getters
  getSignalById: (id: string) => Signal | undefined;
  getMissionById: (id: string) => Mission | undefined;
  getSignalsForMission: (missionId: string) => Signal[];
  getResponsesForSignal: (signalId: string) => Response[];
  getPendingVerificationSignals: () => Signal[];
  getDominantSignals: (count: number) => Signal[];
  getActiveCommitments: () => Commitment[];
  getUnresolvedFriction: () => FrictionItem[];
}

const WorkContext = createContext<WorkContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

export function WorkProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workReducer, initialState);

  // Signal actions
  const addSignal = useCallback((signal: Signal) => {
    dispatch({ type: "ADD_SIGNAL", payload: signal });
  }, []);

  const addSignals = useCallback((signals: Signal[]) => {
    signals.forEach(signal => dispatch({ type: "ADD_SIGNAL", payload: signal }));
  }, []);

  const updateSignal = useCallback((id: string, updates: Partial<Signal>) => {
    dispatch({ type: "UPDATE_SIGNAL", payload: { id, updates } });
  }, []);

  const removeSignal = useCallback((id: string) => {
    dispatch({ type: "REMOVE_SIGNAL", payload: id });
  }, []);

  const verifySignal = useCallback((id: string, status: Signal["verificationStatus"], notes?: string) => {
    dispatch({
      type: "UPDATE_SIGNAL",
      payload: {
        id,
        updates: {
          verificationStatus: status,
          modificationNotes: notes,
          verifiedBy: "current-user", // TODO: Replace with actual user
        },
      },
    });
  }, []);

  // Mission actions
  const addMission = useCallback((mission: Mission) => {
    dispatch({ type: "ADD_MISSION", payload: mission });
  }, []);

  const updateMission = useCallback((id: string, updates: Partial<Mission>) => {
    dispatch({ type: "UPDATE_MISSION", payload: { id, updates } });
  }, []);

  // Response actions
  const respondToSignal = useCallback((
    signalId: string,
    responseType: ResponseType,
    justification: string,
    aiRecommendation: ResponseType,
    aiReasoning: string,
    aiConfidence: number
  ) => {
    const signal = state.signals.find(s => s.id === signalId);
    if (!signal) return;

    const response: Response = {
      id: crypto.randomUUID(),
      signalId,
      type: responseType,
      ownerId: "current-user",
      ownerName: "Current User",
      justification,
      aiRecommendation,
      aiReasoning,
      aiConfidence,
      humanOverride: responseType !== aiRecommendation,
      pressureAtDecision: signal.pressureLevel,
      createdAt: new Date(),
    };

    dispatch({ type: "ADD_RESPONSE", payload: response });
  }, [state.signals]);

  // Commitment actions
  const addCommitment = useCallback((commitment: Commitment) => {
    dispatch({ type: "ADD_COMMITMENT", payload: commitment });
  }, []);

  const updateCommitment = useCallback((id: string, updates: Partial<Commitment>) => {
    dispatch({ type: "UPDATE_COMMITMENT", payload: { id, updates } });
  }, []);

  // Outcome actions
  const recordOutcome = useCallback((outcome: Outcome) => {
    dispatch({ type: "ADD_OUTCOME", payload: outcome });
  }, []);

  // Friction actions
  const addFriction = useCallback((friction: FrictionItem) => {
    dispatch({ type: "ADD_FRICTION", payload: friction });
  }, []);

  const resolveFriction = useCallback((id: string) => {
    dispatch({ type: "RESOLVE_FRICTION", payload: id });
  }, []);

  // UI actions
  const selectSignal = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_SIGNAL", payload: id });
  }, []);

  const selectMission = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_MISSION", payload: id });
  }, []);

  const setFirstRun = useCallback((isFirstRun: boolean) => {
    dispatch({ type: "SET_FIRST_RUN", payload: isFirstRun });
  }, []);

  // Getters
  const getSignalById = useCallback((id: string) => {
    return state.signals.find(s => s.id === id);
  }, [state.signals]);

  const getMissionById = useCallback((id: string) => {
    return state.missions.find(m => m.id === id);
  }, [state.missions]);

  const getSignalsForMission = useCallback((missionId: string) => {
    return state.signals.filter(s => s.missionId === missionId);
  }, [state.signals]);

  const getResponsesForSignal = useCallback((signalId: string) => {
    return state.responses.filter(r => r.signalId === signalId);
  }, [state.responses]);

  const getPendingVerificationSignals = useCallback(() => {
    return state.signals.filter(s => s.verificationStatus === "pending_review");
  }, [state.signals]);

  const getDominantSignals = useCallback((count: number) => {
    return [...state.signals]
      .filter(s => s.state !== "ignored" && s.verificationStatus === "verified")
      .sort((a, b) => b.pressureLevel - a.pressureLevel)
      .slice(0, count);
  }, [state.signals]);

  const getActiveCommitments = useCallback(() => {
    return state.commitments.filter(c => c.status === "active");
  }, [state.commitments]);

  const getUnresolvedFriction = useCallback(() => {
    return state.frictionItems.filter(f => !f.resolvedAt);
  }, [state.frictionItems]);

  const value: WorkContextType = {
    state,
    addSignal,
    addSignals,
    updateSignal,
    removeSignal,
    verifySignal,
    addMission,
    updateMission,
    respondToSignal,
    addCommitment,
    updateCommitment,
    recordOutcome,
    addFriction,
    resolveFriction,
    selectSignal,
    selectMission,
    setFirstRun,
    getSignalById,
    getMissionById,
    getSignalsForMission,
    getResponsesForSignal,
    getPendingVerificationSignals,
    getDominantSignals,
    getActiveCommitments,
    getUnresolvedFriction,
  };

  return (
    <WorkContext.Provider value={value}>
      {children}
    </WorkContext.Provider>
  );
}

export function useWork() {
  const context = useContext(WorkContext);
  if (context === undefined) {
    throw new Error("useWork must be used within a WorkProvider");
  }
  return context;
}