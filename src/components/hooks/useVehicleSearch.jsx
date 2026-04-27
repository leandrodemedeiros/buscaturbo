import { db } from '@/lib/db';

import { useState, useEffect, useMemo, useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';

export default function useVehicleSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    brands: [],
    fuels: [],
    transmissions: [],
    states: [],
    bodyTypes: [],
    priceRange: [0, 2000000],
    yearRange: [2010, 2025],
    hpRange: [0, 800],
    mileageMax: 200000,
    locationSearch: '',
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [groupBy, setGroupBy] = useState('none');
  const [viewMode, setViewMode] = useState('grid');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  const debouncedSetQuery = useCallback(
    debounce((value) => setDebouncedQuery(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetQuery(searchQuery);
  }, [searchQuery, debouncedSetQuery]);

  // Fetch vehicles
  const { data: allVehicles = [], isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => db.entities.Vehicle.list('-created_date', 500),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter and sort vehicles - optimized with useMemo
  const filteredVehicles = useMemo(() => {
    let results = [...allVehicles];

    // Text search (optimized with early termination)
    if (debouncedQuery.trim()) {
      const queryLower = debouncedQuery.toLowerCase().trim();
      const queryTerms = queryLower.split(/\s+/);
      
      results = results.filter(vehicle => {
        const searchableText = [
          vehicle.brand,
          vehicle.model,
          vehicle.version,
          vehicle.title
        ].filter(Boolean).join(' ').toLowerCase();
        
        return queryTerms.every(term => searchableText.includes(term));
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      results = results.filter(v => v.category === selectedCategory);
    }

    // Brand filter
    if (filters.brands?.length > 0) {
      results = results.filter(v => filters.brands.includes(v.brand));
    }

    // Fuel filter
    if (filters.fuels?.length > 0) {
      results = results.filter(v => filters.fuels.includes(v.fuel));
    }

    // Transmission filter
    if (filters.transmissions?.length > 0) {
      results = results.filter(v => filters.transmissions.includes(v.transmission));
    }

    // State filter
    if (filters.states?.length > 0) {
      results = results.filter(v => filters.states.includes(v.location_state));
    }

    // Body type filter
    if (filters.bodyTypes?.length > 0) {
      results = results.filter(v => filters.bodyTypes.includes(v.body_type));
    }

    // Price range filter
    if (filters.priceRange) {
      results = results.filter(v => 
        v.price >= filters.priceRange[0] && v.price <= filters.priceRange[1]
      );
    }

    // Year range filter
    if (filters.yearRange) {
      results = results.filter(v => 
        v.year_model >= filters.yearRange[0] && v.year_model <= filters.yearRange[1]
      );
    }

    // Horsepower range filter
    if (filters.hpRange && (filters.hpRange[0] > 0 || filters.hpRange[1] < 800)) {
      results = results.filter(v => 
        !v.horsepower || (v.horsepower >= filters.hpRange[0] && v.horsepower <= filters.hpRange[1])
      );
    }

    // Mileage filter
    if (filters.mileageMax && filters.mileageMax < 200000) {
      results = results.filter(v => !v.mileage || v.mileage <= filters.mileageMax);
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        results.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        results.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'year_desc':
        results.sort((a, b) => (b.year_model || 0) - (a.year_model || 0));
        break;
      case 'year_asc':
        results.sort((a, b) => (a.year_model || 0) - (b.year_model || 0));
        break;
      case 'mileage_asc':
        results.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
        break;
      case 'hp_desc':
        results.sort((a, b) => (b.horsepower || 0) - (a.horsepower || 0));
        break;
      default:
        // Relevance: featured first, then by date
        results.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return new Date(b.created_date) - new Date(a.created_date);
        });
    }

    return results;
  }, [allVehicles, debouncedQuery, selectedCategory, filters, sortBy]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.brands?.length > 0) count++;
    if (filters.fuels?.length > 0) count++;
    if (filters.transmissions?.length > 0) count++;
    if (filters.states?.length > 0) count++;
    if (filters.bodyTypes?.length > 0) count++;
    if (filters.priceRange?.[0] > 0 || filters.priceRange?.[1] < 2000000) count++;
    if (filters.yearRange?.[0] > 2010 || filters.yearRange?.[1] < 2025) count++;
    if (filters.hpRange?.[0] > 0 || filters.hpRange?.[1] < 800) count++;
    return count;
  }, [filters]);

  // Update filters handler
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      brands: [],
      fuels: [],
      transmissions: [],
      states: [],
      bodyTypes: [],
      priceRange: [0, 2000000],
      yearRange: [2010, 2025],
      hpRange: [0, 800],
      mileageMax: 200000,
    });
    setSearchQuery('');
    setSelectedCategory('all');
  }, []);

  return {
    // Search state
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    
    // Filter state
    filters,
    handleFilterChange,
    clearFilters,
    activeFiltersCount,
    
    // Sort & view state
    sortBy,
    setSortBy,
    groupBy,
    setGroupBy,
    viewMode,
    setViewMode,
    
    // Results
    vehicles: filteredVehicles,
    totalResults: filteredVehicles.length,
    isLoading,
    isSearching: isLoading || searchQuery !== debouncedQuery,
    error,
  };
}