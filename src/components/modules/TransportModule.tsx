import React, { useState } from 'react';
import { 
  Bus, 
  MapPin, 
  Phone, 
  Users, 
  Navigation, 
  CheckCircle2, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { TransportRoute } from '../../types';

export const TransportModule: React.FC = () => {
  const { routes } = useERP();
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');

  const selectedRoute = routes.find((r: TransportRoute) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">School Bus Fleet & Routes</h1>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              GPS Live Monitoring
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Fleet tracking, student boarding rosters, verified driver credentials, and designated route stops.
          </p>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map((route: TransportRoute) => {
          const isSelected = route.id === selectedRoute?.id;

          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-50/50 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-xs bg-slate-900 text-white px-2 py-0.5 rounded font-bold">
                    {route.vehicleNo}
                  </span>
                  <span className="flex items-center space-x-1 text-emerald-600 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>On Route</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-2">{route.routeName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Stops: {route.stops.length} locations</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Driver: {route.driverName}</span>
                <span className="font-mono-tech">{route.driverPhone}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route Detail */}
      {selectedRoute && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{selectedRoute.routeName} — Live Route Map</h2>
              <p className="text-xs text-slate-500">Vehicle: {selectedRoute.vehicleNo} • Driver: {selectedRoute.driverName} ({selectedRoute.driverPhone})</p>
            </div>
            <div className="flex items-center space-x-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Speed Governor & CCTV Verified</span>
            </div>
          </div>

          {/* Route Stops Stepper */}
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-4">Designated Boarding Stops</h3>
            <div className="space-y-4">
              {selectedRoute.stops.map((stop: string, idx: number) => (
                <div key={stop} className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0 ? 'bg-blue-600 text-white' :
                      idx === selectedRoute.stops.length - 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {idx + 1}
                    </div>
                    {idx < selectedRoute.stops.length - 1 && (
                      <div className="w-0.5 h-6 bg-slate-200 my-0.5" />
                    )}
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{stop}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Estimated Pickup: 07:{15 + idx * 12} AM</p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Geo-Fenced
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
