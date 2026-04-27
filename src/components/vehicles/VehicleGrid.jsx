import React, { useMemo } from 'react';
import VehicleCard from './VehicleCard';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Trophy, Gauge, Calendar, Tag } from 'lucide-react';

const GROUP_ICONS = {
  brand: Car,
  category: Tag,
  body_type: Car,
  year: Calendar,
};

const CATEGORY_LABELS = {
  passeio: 'Passeio',
  colecionador: 'Colecionador',
  esportivo: 'Esportivo',
};

const BODY_TYPE_LABELS = {
  sedan: 'Sedan',
  hatch: 'Hatch',
  suv: 'SUV',
  pickup: 'Pickup',
  coupe: 'Coupé',
  conversivel: 'Conversível',
  wagon: 'Wagon',
  van: 'Van',
};

export default function VehicleGrid({ 
  vehicles, 
  viewMode,
  groupBy,
  compareList,
  onCompareToggle,
  onViewVehicle,
  isLoading,
  maxCompare = 4
}) {
  const compareDisabled = compareList.length >= maxCompare;
  // Group vehicles if groupBy is set
  const groupedVehicles = useMemo(() => {
    if (!groupBy || groupBy === 'none') {
      return { '': vehicles };
    }

    return vehicles.reduce((acc, vehicle) => {
      let key;
      switch (groupBy) {
        case 'brand':
          key = vehicle.brand;
          break;
        case 'category':
          key = CATEGORY_LABELS[vehicle.category] || vehicle.category;
          break;
        case 'body_type':
          key = BODY_TYPE_LABELS[vehicle.body_type] || vehicle.body_type;
          break;
        case 'year':
          key = vehicle.year_model?.toString();
          break;
        default:
          key = '';
      }
      if (!acc[key]) acc[key] = [];
      acc[key].push(vehicle);
      return acc;
    }, {});
  }, [vehicles, groupBy]);

  const sortedGroupKeys = useMemo(() => {
    const keys = Object.keys(groupedVehicles).filter(k => k);
    if (groupBy === 'year') {
      return keys.sort((a, b) => parseInt(b) - parseInt(a));
    }
    return keys.sort();
  }, [groupedVehicles, groupBy]);

  const GroupIcon = GROUP_ICONS[groupBy] || Car;

  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-6",
        viewMode === 'list' ? "grid-cols-1" : 
        viewMode === 'compact' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" :
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-zinc-100 rounded-2xl animate-pulse aspect-[4/3]" />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
          <Car className="w-10 h-10 text-zinc-400" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-2">Nenhum veículo encontrado</h3>
        <p className="text-zinc-500 max-w-md">
          Tente ajustar os filtros ou buscar por outro termo para encontrar o veículo ideal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <AnimatePresence mode="wait">
        {(groupBy && groupBy !== 'none') ? (
          sortedGroupKeys.map((groupKey) => (
            <motion.div
              key={groupKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Group header */}
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-200">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <GroupIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">{groupKey}</h2>
                  <p className="text-sm text-zinc-500">{groupedVehicles[groupKey].length} veículos</p>
                </div>
              </div>

              {/* Group items */}
              <div className={cn(
                "grid gap-6",
                viewMode === 'list' ? "grid-cols-1" : 
                viewMode === 'compact' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" :
                "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              )}>
                {groupedVehicles[groupKey].map((vehicle, index) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <VehicleCard
                     vehicle={vehicle}
                     viewMode={viewMode}
                     isComparing={compareList.some(v => v.id === vehicle.id)}
                     compareDisabled={compareDisabled}
                     onCompareToggle={onCompareToggle}
                     onView={onViewVehicle}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "grid gap-6",
              viewMode === 'list' ? "grid-cols-1" : 
              viewMode === 'compact' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" :
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <VehicleCard
                  vehicle={vehicle}
                  viewMode={viewMode}
                  isComparing={compareList.some(v => v.id === vehicle.id)}
                  compareDisabled={compareDisabled}
                  onCompareToggle={onCompareToggle}
                  onView={onViewVehicle}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}