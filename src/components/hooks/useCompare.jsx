import { useState, useCallback } from 'react';

const MAX_COMPARE_ITEMS = 4;

export default function useCompare() {
  const [compareList, setCompareList] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const addToCompare = useCallback((vehicle) => {
    setCompareList(prev => {
      if (prev.length >= MAX_COMPARE_ITEMS) return prev;
      if (prev.some(v => v.id === vehicle.id)) return prev;
      return [...prev, vehicle];
    });
  }, []);

  const removeFromCompare = useCallback((vehicleId) => {
    setCompareList(prev => prev.filter(v => v.id !== vehicleId));
  }, []);

  const toggleCompare = useCallback((vehicle) => {
    setCompareList(prev => {
      const exists = prev.some(v => v.id === vehicle.id);
      if (exists) {
        return prev.filter(v => v.id !== vehicle.id);
      } else {
        if (prev.length >= MAX_COMPARE_ITEMS) return prev;
        return [...prev, vehicle];
      }
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const openCompareModal = useCallback(() => {
    if (compareList.length >= 2) {
      setIsCompareModalOpen(true);
    }
  }, [compareList.length]);

  const closeCompareModal = useCallback(() => {
    setIsCompareModalOpen(false);
  }, []);

  return {
    compareList,
    maxItems: MAX_COMPARE_ITEMS,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    clearCompare,
    isCompareModalOpen,
    openCompareModal,
    closeCompareModal,
  };
}