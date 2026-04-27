import React from 'react';
import { 
  Heart, Share2, Gauge, Fuel, Settings2, MapPin, 
  Calendar, Zap, Trophy, Car, Plus, Check, Eye
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function VehicleCard({ 
  vehicle, 
  viewMode = 'grid',
  isComparing,
  compareDisabled,
  onCompareToggle,
  onView
}) {
  const categoryConfig = CATEGORY_CONFIG[vehicle.category] || CATEGORY_CONFIG.passeio;
  const CategoryIcon = categoryConfig.icon;

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

  // Default image if none provided
  const mainImage = vehicle.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80';

  if (viewMode === 'list') {
    return (
      <div className={cn(
        "flex bg-white rounded-2xl border-2 overflow-hidden card-lift group",
        isComparing ? "border-red-500 ring-2 ring-red-200" : "border-zinc-100 hover:border-zinc-200"
      )}>
        {/* Image */}
        <div className="relative w-72 h-48 flex-shrink-0">
          <img 
            src={mainImage}
            alt={vehicle.title}
            className="w-full h-full object-cover"
          />
          {vehicle.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                <Zap className="w-3 h-3 mr-1" />
                Destaque
              </Badge>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={cn(categoryConfig.color, "text-white border-0")}>
              <CategoryIcon className="w-3 h-3 mr-1" />
              {categoryConfig.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-zinc-500 font-medium">{vehicle.brand}</p>
              <h3 className="text-xl font-bold text-zinc-900 mt-0.5">{vehicle.model}</h3>
              <p className="text-sm text-zinc-600 mt-0.5">{vehicle.version}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-zinc-900">{formatPrice(vehicle.price)}</p>
              <p className="text-sm text-zinc-500">{vehicle.year_fabrication}/{vehicle.year_model}</p>
            </div>
          </div>

          {/* Specs Row */}
          <div className="flex items-center gap-6 mt-4 text-sm text-zinc-600">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-zinc-400" />
              {formatMileage(vehicle.mileage)}
            </span>
            <span className="flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-zinc-400" />
              {FUEL_LABELS[vehicle.fuel] || vehicle.fuel}
            </span>
            <span className="flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-zinc-400" />
              {TRANSMISSION_LABELS[vehicle.transmission] || vehicle.transmission}
            </span>
            {vehicle.horsepower && (
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-red-500" />
                <strong className="text-red-600">{vehicle.horsepower} cv</strong>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-zinc-400" />
              {vehicle.location_city}, {vehicle.location_state}
            </span>
          </div>

          {/* Special features */}
          {vehicle.special_features?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {vehicle.special_features.slice(0, 3).map((feature, i) => (
                <Badge key={i} variant="secondary" className="bg-zinc-100 text-zinc-700">
                  {feature}
                </Badge>
              ))}
              {vehicle.special_features.length > 3 && (
                <Badge variant="secondary" className="bg-zinc-100 text-zinc-500">
                  +{vehicle.special_features.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-auto pt-4">
            <Button 
              onClick={() => onView?.(vehicle)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver detalhes
            </Button>
            <Button 
              variant="outline"
              onClick={() => onCompareToggle?.(vehicle)}
              disabled={!isComparing && compareDisabled}
              className={cn(
                "rounded-xl",
                isComparing && "border-red-500 text-red-600",
                !isComparing && compareDisabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {isComparing ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Comparando
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Comparar
                </>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl ml-auto">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className={cn(
      "bg-white rounded-2xl border-2 overflow-hidden card-lift group",
      isComparing ? "border-red-500 ring-2 ring-red-200" : "border-zinc-100 hover:border-zinc-200"
    )}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={mainImage}
          alt={vehicle.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            {vehicle.is_featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 w-fit">
                <Zap className="w-3 h-3 mr-1" />
                Destaque
              </Badge>
            )}
          </div>
          <Badge className={cn(categoryConfig.color, "text-white border-0")}>
            <CategoryIcon className="w-3 h-3 mr-1" />
            {categoryConfig.label}
          </Badge>
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur">
            <Heart className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-2xl font-bold text-white drop-shadow-lg">{formatPrice(vehicle.price)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-zinc-500 font-medium">{vehicle.brand}</p>
            <h3 className="text-lg font-bold text-zinc-900 truncate">{vehicle.model}</h3>
            <p className="text-sm text-zinc-600 truncate">{vehicle.version}</p>
          </div>
          {vehicle.horsepower && (
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 text-red-500">
                <Zap className="w-4 h-4" />
                <span className="font-bold">{vehicle.horsepower}</span>
                <span className="text-xs font-semibold text-red-400">cv</span>
              </div>
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div className="flex items-center gap-1.5 text-zinc-600">
            <Calendar className="w-4 h-4 text-zinc-400" />
            {vehicle.year_fabrication}/{vehicle.year_model}
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600">
            <Gauge className="w-4 h-4 text-zinc-400" />
            {formatMileage(vehicle.mileage)}
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600">
            <Fuel className="w-4 h-4 text-zinc-400" />
            {FUEL_LABELS[vehicle.fuel] || vehicle.fuel}
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600">
            <MapPin className="w-4 h-4 text-zinc-400" />
            {vehicle.location_state}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100">
          <Button 
            onClick={() => onView?.(vehicle)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-10"
          >
            Ver detalhes
          </Button>
          <Button 
            variant="outline"
            onClick={() => onCompareToggle?.(vehicle)}
            disabled={!isComparing && compareDisabled}
            className={cn(
              "h-10 px-3 rounded-xl text-xs font-semibold gap-1.5",
              isComparing && "border-red-500 text-red-600 bg-red-50",
              !isComparing && compareDisabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {isComparing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {isComparing ? 'Comparando' : 'Comparar'}
          </Button>
        </div>
      </div>
    </div>
  );
}