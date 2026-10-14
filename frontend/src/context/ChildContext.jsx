import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_CHILDREN } from "../services/mockData";

const ChildContext = createContext(null);
const STORAGE_KEY = "vaxcare_children_list";
const ACTIVE_KEY = "vaxcare_active_child_id";

export function ChildProvider({ children }) {
  const [childrenList, setChildrenList] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_CHILDREN;
    } catch {
      return INITIAL_CHILDREN;
    }
  });

  const [activeChildId, setActiveChildId] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_KEY);
      return stored || (INITIAL_CHILDREN[0] ? INITIAL_CHILDREN[0].id : null);
    } catch {
      return INITIAL_CHILDREN[0]?.id || null;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(childrenList));
  }, [childrenList]);

  useEffect(() => {
    if (activeChildId) {
      localStorage.setItem(ACTIVE_KEY, activeChildId);
    }
  }, [activeChildId]);

  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0] || null;

  const addChild = (childData) => {
    const newChild = {
      ...childData,
      id: "child-" + Date.now()
    };
    setChildrenList((prev) => [...prev, newChild]);
    setActiveChildId(newChild.id);
  };

  const updateChild = (id, updatedData) => {
    setChildrenList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
  };

  return (
    <ChildContext.Provider
      value={{
        childrenList,
        activeChild,
        activeChildId,
        setActiveChildId,
        addChild,
        updateChild
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
