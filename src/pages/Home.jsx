import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';

import Header from '@/components/layout/Header';
import FilterBar from '@/components/search/FilterBar';
import SortBar from '@/components/search/SortBar';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import CompareBar from '@/components/vehicles/CompareBar';

import useVehicleSearch from '@/components/hooks/useVehicleSearch';
import useCompare from '@/components/hooks/useCompare';

export default function Home() {
  const [isCompareExpanded, setIsCompareExpanded] = useState(false);

  const [sellerTypeFilter, setSellerTypeFilter] = useState('all');

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filters,
    handleFilterChange,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
    groupBy,
    setGroupBy,
    viewMode,
    setViewMode,
    vehicles,
    totalResults,
    isLoading,
    isSearching,
  } = useVehicleSearch();

  const {
    compareList,
    maxItems,
    toggleCompare,
    removeFromCompare,
    clearCompare,
  } = useCompare();

  const handleViewVehicle = (vehicle) => {
    console.log('View vehicle:', vehicle);
  };

  const handleClearCompare = () => {
    clearCompare();
    setIsCompareExpanded(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header with category pills */}
      <Header
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-40">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          activeFiltersCount={activeFiltersCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSearching={isSearching}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <SortBar
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalResults={totalResults}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          sellerTypeFilter={sellerTypeFilter}
          onSellerTypeChange={setSellerTypeFilter}
        />

        <div className="mt-6 pb-32">
          <VehicleGrid
            vehicles={vehicles}
            viewMode={viewMode}
            groupBy={groupBy}
            compareList={compareList}
            maxCompare={maxItems}
            onCompareToggle={toggleCompare}
            onViewVehicle={handleViewVehicle}
            isLoading={isLoading}
          />
        </div>
      </main>

      {/* Compare bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <CompareBar
            vehicles={compareList}
            maxItems={maxItems}
            onRemove={removeFromCompare}
            onClear={handleClearCompare}
            onCompare={() => setIsCompareExpanded(true)}
            isExpanded={isCompareExpanded}
            onToggleExpand={() => setIsCompareExpanded(prev => !prev)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}