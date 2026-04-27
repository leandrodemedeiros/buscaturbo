import React from 'react';
import { X, ArrowRight, Zap, Fuel, Settings2, Gauge, Calendar, MapPin, Trophy, Car, Check, Minus, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_CONFIG = {
  passeio: { color: 'bg-blue-500', label: 'Passeio' },
  colecionador: { color: 'bg-amber-500', label: 'Colecionador' },
  esportivo: { color: 'bg-red-500', label: 'Esportivo' },
};

const FUEL_LABELS = { gasolina: 'Gasolina', etanol: 'Etanol', flex: 'Flex', diesel: 'Diesel', eletrico: 'Elétrico', hibrido: 'Híbrido' };
const TRANSMISSION_LABELS = { manual: 'Manual', automatico: 'Automático', automatizado: 'Automatizado', cvt: 'CVT' };
const DRIVETRAIN_LABELS = { fwd: 'Dianteira', rwd: 'Traseira', awd: 'Integral', '4wd': '4x4' };

const formatPrice = (price) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(price);
const formatMileage = (km) => new Intl.NumberFormat('pt-BR').format(km) + ' km';

function CompareTable({ vehicles, onRemove }) {
  const getBestValue = (field, mode = 'min') => {
    const values = vehicles.map(v => v[field]).filter(v => v != null);
    if (values.length === 0) return null;
    return mode === 'min' ? Math.min(...values) : Math.max(...values);
  };

  const CompareRow = ({ label, field, format, mode = 'none', icon: Icon }) => {
    const bestValue = mode !== 'none' ? getBestValue(field, mode) : null;
    return (
      <tr className="border-b border-zinc-100">
        <td className="py-2.5 px-4 font-medium text-zinc-700 bg-zinc-50 text-sm flex items-center gap-1.5 whitespace-nowrap">
          {Icon && <Icon className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />}
          {label}
        </td>
        {vehicles.map((vehicle) => {
          const value = vehicle[field];
          const isBest = bestValue != null && value === bestValue;
          const displayValue = format ? format(value) : value;
          return (
            <td key={vehicle.id} className={cn("py-2.5 px-4 text-center text-sm", isBest && "bg-green-50")}>
              {value != null ? (
                <span className={cn("font-medium", isBest && "text-green-600")}>
                  {displayValue}
                  {isBest && <Check className="w-3.5 h-3.5 inline ml-1" />}
                </span>
              ) : (
                <Minus className="w-3.5 h-3.5 text-zinc-300 mx-auto" />
              )}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full border-collapse min-w-max">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="w-44 bg-white" />
            {vehicles.map((vehicle) => {
              const categoryConfig = CATEGORY_CONFIG[vehicle.category];
              return (
                <th key={vehicle.id} className="p-3 bg-white min-w-[200px]">
                  <div className="relative">
                    <button
                      onClick={() => onRemove(vehicle.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-200 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="rounded-lg overflow-hidden mb-2">
                      <img
                        src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80'}
                        alt={vehicle.model}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                    {categoryConfig && (
                      <Badge className={cn(categoryConfig.color, "text-white border-0 mb-1 text-xs")}>
                        {categoryConfig.label}
                      </Badge>
                    )}
                    <p className="text-xs text-zinc-500">{vehicle.brand}</p>
                    <h3 className="font-bold text-sm">{vehicle.model}</h3>
                    <p className="text-red-600 font-bold text-base mt-1">{formatPrice(vehicle.price)}</p>
                    <Button size="sm" className="mt-2 w-full bg-zinc-900 hover:bg-zinc-700 text-white text-xs h-7 rounded-lg">
                      Simular financiamento
                    </Button>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={vehicles.length + 1} className="py-1.5 px-4 bg-zinc-900 text-white font-semibold text-xs uppercase tracking-wide">
              Informações Gerais
            </td>
          </tr>
          <CompareRow label="Ano" field="year_model" icon={Calendar} />
          <CompareRow label="Quilometragem" field="mileage" format={formatMileage} mode="min" icon={Gauge} />
          <CompareRow label="Combustível" field="fuel" format={(v) => FUEL_LABELS[v] || v} icon={Fuel} />
          <CompareRow label="Câmbio" field="transmission" format={(v) => TRANSMISSION_LABELS[v] || v} icon={Settings2} />
          <CompareRow label="Localização" field="location_state" icon={MapPin} />
          <tr>
            <td colSpan={vehicles.length + 1} className="py-1.5 px-4 bg-red-600 text-white font-semibold text-xs uppercase tracking-wide">
              Desempenho
            </td>
          </tr>
          <CompareRow label="Motor" field="engine" icon={Settings2} />
          <CompareRow label="Potência (cv)" field="horsepower" mode="max" icon={Zap} />
          <CompareRow label="Torque (kgfm)" field="torque" mode="max" icon={Gauge} />
          <CompareRow label="0-100 km/h (s)" field="acceleration_0_100" mode="min" icon={Gauge} />
          <CompareRow label="Vel. Máx (km/h)" field="top_speed" mode="max" icon={Gauge} />
          <CompareRow label="Tração" field="drivetrain" format={(v) => DRIVETRAIN_LABELS[v] || v} icon={Settings2} />
          <tr>
            <td colSpan={vehicles.length + 1} className="py-1.5 px-4 bg-amber-500 text-white font-semibold text-xs uppercase tracking-wide">
              Itens Especiais
            </td>
          </tr>
          <tr className="border-b border-zinc-100">
            <td className="py-2.5 px-4 font-medium text-zinc-700 bg-zinc-50 text-sm">Destaques</td>
            {vehicles.map((vehicle) => (
              <td key={vehicle.id} className="py-2.5 px-4">
                <div className="flex flex-wrap gap-1 justify-center">
                  {vehicle.special_features?.length > 0 ? (
                    vehicle.special_features.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800 text-xs">{feature}</Badge>
                    ))
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-zinc-300" />
                  )}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function CompareBar({
  vehicles,
  onRemove,
  onCompare,
  maxItems = 4,
  isExpanded,
  onToggleExpand,
  onClear
}) {
  if (vehicles.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Close button floating above bar */}
      {!isExpanded && (
        <div className="absolute -top-5 right-6">
          <button
            onClick={onClear}
            className="w-9 h-9 rounded-full bg-white border border-zinc-200 shadow-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Expanded compare panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: '65vh', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white border-t border-zinc-200 shadow-[0_-8px_40px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                  <Gauge className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-zinc-900">Comparativo de Veículos</span>
                <Badge variant="secondary" className="text-xs">{vehicles.length} veículos</Badge>
              </div>
              <button
                onClick={onToggleExpand}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-zinc-600" />
              </button>
            </div>

            {/* Compare table */}
            <CompareTable vehicles={vehicles} onRemove={onRemove} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini bar */}
      <div className={cn(
        "bg-white border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.10)]",
        isExpanded && "border-t-0"
      )}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Vehicle thumbnails */}
            <div className="flex-1 flex items-center gap-3 overflow-x-auto">
              <AnimatePresence mode="popLayout">
                {vehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-2 pr-4 flex-shrink-0 mt-2 mb-1"
                  >
                    <img
                      src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80'}
                      alt={vehicle.model}
                      className="w-14 h-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-zinc-900 font-medium text-sm truncate max-w-28">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-zinc-500 text-xs">{formatPrice(vehicle.price)}</p>
                    </div>
                    {/* Remove button — always visible, outside card bounds */}
                    <button
                      onClick={() => onRemove(vehicle.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty slots */}
              {Array.from({ length: maxItems - vehicles.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-36 h-14 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-zinc-400 text-xs">+ adicionar</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                onClick={onClear}
                className="rounded-xl text-zinc-600 border-zinc-200 h-9"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
              <Button
                onClick={onToggleExpand}
                disabled={vehicles.length < 2}
                className={cn(
                  "rounded-xl px-5 h-9",
                  "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isExpanded ? 'Minimizar' : 'Comparar agora'}
                {!isExpanded && <ArrowRight className="w-4 h-4 ml-1.5" />}
                {isExpanded && <ChevronDown className="w-4 h-4 ml-1.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}