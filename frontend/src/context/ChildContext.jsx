import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const ChildContext = createContext(null);
const ACTIVE_KEY = "vaxcare_active_child_id";

export function ChildProvider({ children }) {
  const { user } = useAuth();
  const [childrenList, setChildrenList] = useState([]);

  const [activeChildId, setActiveChildId] = useState(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);

  // 1. Fetch children from backend
  const loadChildren = useCallback(async () => {
    setLoadingChildren(true);
    try {
      const data = await api.getChildren();
      setChildrenList(data || []);
      if (data && data.length > 0) {
        // Keep current active if still valid, or default to first
        const currentStored = localStorage.getItem(ACTIVE_KEY);
        const exists = data.some((c) => String(c.id) === String(currentStored));
        if (exists) {
          setActiveChildId(currentStored);
        } else {
          setActiveChildId(String(data[0].id));
          localStorage.setItem(ACTIVE_KEY, String(data[0].id));
        }
      } else {
        setActiveChildId(null);
      }
    } catch (err) {
      console.error("Failed to load children from backend:", err);
    } finally {
      setLoadingChildren(false);
    }
  }, []);

  useEffect(() => {
    loadChildren();
  }, [user, loadChildren]);


  // Sync activeChildId to localStorage
  useEffect(() => {
    if (activeChildId) {
      localStorage.setItem(ACTIVE_KEY, String(activeChildId));
    }
  }, [activeChildId]);

  const activeChild = childrenList.find((c) => String(c.id) === String(activeChildId)) || childrenList[0] || null;

  // 2. Fetch auto-calculated schedule for the active child from backend
  const loadSchedule = useCallback(async (childId) => {
    if (!childId) {
      setSchedule([]);
      return;
    }
    setLoadingSchedule(true);
    try {
      const scheduleData = await api.getChildSchedule(childId);
      setSchedule(scheduleData || []);
    } catch (err) {
      console.error("Failed to load schedule from backend:", err);
    } finally {
      setLoadingSchedule(false);
    }
  }, []);

  useEffect(() => {
    if (activeChild?.id) {
      loadSchedule(activeChild.id);
    } else {
      setSchedule([]);
    }
  }, [activeChild?.id, loadSchedule]);

  // 3. Add child profile to backend
  const addChild = async (childData) => {
    const res = await api.createChild(childData);
    if (res.success && res.data) {
      const newChild = res.data;
      setChildrenList((prev) => [...prev, newChild]);
      setActiveChildId(String(newChild.id));
      localStorage.setItem(ACTIVE_KEY, String(newChild.id));
      // Load auto-calculated schedule for newly created child
      await loadSchedule(newChild.id);
      return { success: true, data: newChild };
    }
    return res;
  };

  // 4. Update child profile
  const updateChild = async (id, updatedData) => {
    const res = await api.updateChild(id, updatedData);
    if (res.success && res.data) {
      setChildrenList((prev) =>
        prev.map((c) => (String(c.id) === String(id) ? { ...c, ...res.data } : c))
      );
      if (String(activeChildId) === String(id)) {
        await loadSchedule(id);
      }
    }
    return res;
  };

  // 5. Update vaccination milestone status in backend
  const updateVaccineStatus = async (vaxId, newStatus, dateCompleted = null, reaction = null) => {
    if (!activeChild?.id) return;
    try {
      const updatedSchedule = await api.updateChildVaccineStatus(
        activeChild.id,
        vaxId,
        newStatus,
        dateCompleted,
        reaction
      );
      if (updatedSchedule && Array.isArray(updatedSchedule)) {
        setSchedule(updatedSchedule);
      } else {
        await loadSchedule(activeChild.id);
      }
    } catch (err) {
      console.error("Failed to update vaccine status:", err);
    }
  };

  return (
    <ChildContext.Provider
      value={{
        childrenList,
        activeChild,
        activeChildId,
        setActiveChildId,
        addChild,
        updateChild,
        loadChildren,
        schedule,
        loadingSchedule,
        loadingChildren,
        refreshSchedule: () => loadSchedule(activeChild?.id),
        updateVaccineStatus,
        isAddChildModalOpen,
        setIsAddChildModalOpen
      }}
    >
      {children}
    </ChildContext.Provider>
  );
}

export function useChild() {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error("useChild must be used within a ChildProvider");
  }
  return context;
}
