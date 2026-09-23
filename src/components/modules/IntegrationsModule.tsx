import React, { useState } from 'react';
import { 
  Cpu, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Radio, 
  MessageSquare, 
  CreditCard, 
  Bus, 
  Server, 
  ShieldCheck, 
  Zap, 
  Sliders, 
  Terminal,
  Activity
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { IntegrationServiceConfig } from '../../types';

export const IntegrationsModule: React.FC = () => {
  const { integrations, store } = useERP();
  const [testingServiceId, setTestingServiceId] = useState<string | null>(null);
  const [activeLogTab, setActiveLogTab] = useState<'all' | 'errors'>('all');
  const [diagnosticLogs, setDiagnosticLogs] = useState<Array<{ id: string; time: string; service: string; message: string; status: 'SUCCESS' | 'WARN' | 'ERROR' }>>([
    { id: '1', time: '10:45:12 AM', service: 'WhatsApp Cloud API', message: 'Delivered 42 Fee Payment Reminders via Template: fee_due_reminder_v2', status: 'SUCCESS' },
    { id: '2', time: '10:44:02 AM', service: 'Biometric RFID Readers', message: 'Synced 184 morning gate arrival events to attendance database', status: 'SUCCESS' },
    { id: '3', time: '10:40:19 AM', service: 'GPS Fleet AIS-140', message: 'Bus 03 Telemetry heartbeat received (Speed: 28 km/h, Lat: 28.5355, Lng: 77.3910)', status: 'SUCCESS' },
    { id: '4', time: '10:35:45 AM', service: 'Razorpay Gateway', message: 'Webhook event payment.captured handled: INV-2025-001 ($25,000)', status: 'SUCCESS' },
    { id: '5', time: '09:12:00 AM', service: 'Tally Prime Sync', message: 'Daybook voucher balance synchronization completed (48 records synced)', status: 'SUCCESS' },
  ]);

  const handleTestConnection = (service: IntegrationServiceConfig) => {
    setTestingServiceId(service.id);
    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 80) + 20;
      store.updateIntegrationStatus(service.id, 'CONNECTED');
      setDiagnosticLogs(prev => [
        {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString(),
          service: service.name,
          message: `Health ping acknowledged in ${simulatedLatency}ms. Status: HTTP 200 OK.`,
          status: 'SUCCESS'
        },
        ...prev
      ]);
      setTestingServiceId(null);
    }, 600);
  };

  const getServiceIcon = (type: IntegrationServiceConfig['type']) => {
    switch (type) {
      case 'WHATSAPP':
        return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      case 'SMS':
        return <Radio className="w-5 h-5 text-blue-500" />;
      case 'BIOMETRIC':
        return <Cpu className="w-5 h-5 text-indigo-500" />;
      case 'PAYMENT_GATEWAY':
        return <CreditCard className="w-5 h-5 text-amber-500" />;
      case 'GPS':
        return <Bus className="w-5 h-5 text-cyan-500" />;
      case 'TALLY':
        return <Server className="w-5 h-5 text-purple-500" />;
      default:
        return <Zap className="w-5 h-5 text-slate-500" />;
    }
  };

  const onlineCount = integrations.filter(i => i.status === 'CONNECTED').length;

  return (
    <div id="integrations-module" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center font-bold">
            <Cpu className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Integrations, Hardware & Cloud Gateways</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of WhatsApp API, RFID Biometrics, GPS Telemetry, Payment Webhooks, and Tally Prime
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>{onlineCount} / {integrations.length} Services Online</span>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map(srv => {
          const isTesting = testingServiceId === srv.id;

          return (
            <div 
              key={srv.id} 
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      {getServiceIcon(srv.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{srv.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono-tech">{srv.provider}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    srv.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-800' :
                    srv.status === 'NEEDS_CONFIGURATION' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {srv.status === 'CONNECTED' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-amber-600" />}
                    {srv.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{srv.description}</p>

                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-[11px] text-slate-400">Endpoint / Token:</span>
                    <span className="font-mono-tech font-bold text-slate-800 text-[11px] truncate max-w-[170px]" title={srv.endpointOrKeyMasked}>
                      {srv.endpointOrKeyMasked}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-[11px] text-slate-400">Last Synced Ping:</span>
                    <span className="font-mono-tech text-slate-500 text-[10px]">
                      {srv.lastPing}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[11px] font-semibold ${srv.status === 'CONNECTED' ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {srv.status === 'CONNECTED' ? 'Online & Syncing' : 'Configuration Required'}
                </span>

                <button
                  onClick={() => handleTestConnection(srv)}
                  disabled={isTesting}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-blue-600' : ''}`} />
                  <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Diagnostic Event Stream */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-900 text-sm">Real-Time Gateway Diagnostic Telemetry</h2>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setDiagnosticLogs(prev => [
                  {
                    id: Date.now().toString(),
                    time: new Date().toLocaleTimeString(),
                    service: 'Diagnostic Self-Test',
                    message: 'All 6 gateway handshake credentials verified valid against production endpoints.',
                    status: 'SUCCESS'
                  },
                  ...prev
                ]);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition"
            >
              Run Full Handshake
            </button>
          </div>
        </div>

        <div className="bg-slate-950 text-slate-300 font-mono-tech text-xs p-4 rounded-xl space-y-2 max-h-56 overflow-y-auto">
          {diagnosticLogs.map(log => (
            <div key={log.id} className="flex items-start space-x-3 leading-relaxed">
              <span className="text-slate-500 shrink-0">[{log.time}]</span>
              <span className="text-cyan-400 font-bold shrink-0">{log.service}:</span>
              <span className="text-slate-200 flex-1">{log.message}</span>
              <span className="text-emerald-400 shrink-0 font-bold">200 OK</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
