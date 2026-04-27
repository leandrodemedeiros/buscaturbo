import React from 'react';
import { X, Zap, Fuel, Settings2, Gauge, Calendar, MapPin, Trophy, Car, Check, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG = {
  passeio: { icon: Car, color: 'bg-blue-500', label: 'Passeio' },
  colecionador: { icon: Trophy, color: 'bg-amber-500', label: 'Colecionador' },
  esportivo: { icon: Gauge, color: 'bg-red-500', label: 'Esportivo' },
};

const FUEL_LABELS = {
  gasolina: 'Gasolina',
  etanol: 'Etanol',
  flex: 'Flex',
  diesel: 'Diesel',
  eletrico: 'Elétrico',
  hibrido: 'Híbrido',
};

const TRANSMISSION_LABELS = {
  manual: 'Manual',
  automatico: 'Automático',
  automatizado: 'Automatizado',
  cvt: 'CVT',
};

const DRIVETRAIN_LABELS = {
  fwd: 'Dianteira',
  rwd: 'Traseira',
  awd: 'Integral',
  '4wd': '4x4',
};

export default function CompareModal({ isOpen, onClose, vehicles, onRemove }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (km) => {
    return new Intl.NumberFormat('pt-BR').format(km) + ' km';
  };

  // Find best values for highlighting
  const getBestValue = (field, mode = 'min') => {
    const values = vehicles.map(v => v[field]).filter(v => v != null);
    if (values.length === 0) return null;
    return mode === 'min' ? Math.min(...values) : Math.max(...values);
  };

  const CompareRow = ({ label, field, format, mode = 'none', icon: Icon }) => {
    const bestValue = mode !== 'none' ? getBestValue(field, mode) : null;

    return (
      <tr className="border-b border-zinc-100">
        <td className="py-3 px-4 font-medium text-zinc-700 bg-zinc-50 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
          {label}
        </td>
        {vehicles.map((vehicle) => {
          const value = vehicle[field];
          const isBest = bestValue != null && value === bestValue;
          const displayValue = format ? format(value) : value;

          return (
            <td key={vehicle.id} className={cn(
              "py-3 px-4 text-center",
              isBest && "bg-green-50"
            )}>
              {value != null ? (
                <span className={cn(
                  "font-medium",
                  isBest && "text-green-600"
                )}>
                  {displayValue}
                  {isBest && <Check className="w-4 h-4 inline ml-1" />}
                </span>
              ) : (
                <Minus className="w-4 h-4 text-zinc-300 mx-auto" />
              )}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            Comparativo de Veículos
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="w-48 bg-white" />
                {vehicles.map((vehicle) => {
                  const categoryConfig = CATEGORY_CONFIG[vehicle.category];
                  return (
                    <th key={vehicle.id} className="p-4 bg-white min-w-[220px]">
                      <div className="relative">
                        <button
                          onClick={() => onRemove(vehicle.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-200 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="rounded-xl overflow-hidden mb-3">
                          <img 
                            src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80'}
                            alt={vehicle.model}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                        <Badge className={cn(categoryConfig?.color, "text-white border-0 mb-2")}>
                          {categoryConfig?.label}
                        </Badge>
                        <p className="text-sm text-zinc-500">{vehicle.brand}</p>
                        <h3 className="font-bold text-lg">{vehicle.model}</h3>
                        <p className="text-sm text-zinc-600">{vehicle.version}</p>
                        <p className="text-xl font-bold text-red-600 mt-2">{formatPrice(vehicle.price)}</p>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Basic Info */}
              <tr>
                <td colSpan={vehicles.length + 1} className="py-2 px-4 bg-zinc-900 text-white font-semibold text-sm uppercase tracking-wide">
                  Informações Gerais
                </td>
              </tr>
              <CompareRow label="Ano" field="year_model" icon={Calendar} />
              <CompareRow label="Quilometragem" field="mileage" format={formatMileage} mode="min" icon={Gauge} />
              <CompareRow label="Combustível" field="fuel" format={(v) => FUEL_LABELS[v] || v} icon={Fuel} />
              <CompareRow label="Câmbio" field="transmission" format={(v) => TRANSMISSION_LABELS[v] || v} icon={Settings2} />
              <CompareRow label="Localização" field="location_state" icon={MapPin} />

              {/* Performance */}
              <tr>
                <td colSpan={vehicles.length + 1} className="py-2 px-4 bg-red-600 text-white font-semibold text-sm uppercase tracking-wide">
                  Desempenho
                </td>
              </tr>
              <CompareRow label="Motor" field="engine" icon={Settings2} />
              <CompareRow label="Potência (cv)" field="horsepower" mode="max" icon={Zap} />
              <CompareRow label="Torque (kgfm)" field="torque" mode="max" icon={Gauge} />
              <CompareRow label="0-100 km/h (s)" field="acceleration_0_100" mode="min" icon={Gauge} />
              <CompareRow label="Vel. Máxima (km/h)" field="top_speed" mode="max" icon={Gauge} />
              <CompareRow label="Tração" field="drivetrain" format={(v) => DRIVETRAIN_LABELS[v] || v} icon={Settings2} />

              {/* Special Features */}
              <tr>
                <td colSpan={vehicles.length + 1} className="py-2 px-4 bg-amber-500 text-white font-semibold text-sm uppercase tracking-wide">
                  Itens Especiais
                </td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-3 px-4 font-medium text-zinc-700 bg-zinc-50">Destaques</td>
                {vehicles.map((vehicle) => (
                  <td key={vehicle.id} className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {vehicle.special_features?.length > 0 ? (
                        vehicle.special_features.map((feature, i) => (
                          <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                            {feature}
                          </Badge>
                        ))
                      ) : (
                        <Minus className="w-4 h-4 text-zinc-300" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="rounded-xl">
            Fechar comparativo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}