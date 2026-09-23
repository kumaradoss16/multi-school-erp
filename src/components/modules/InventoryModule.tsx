import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  AlertTriangle, 
  Building, 
  X,
  Package
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { InventoryItem, AssetRecord } from '../../types';

export const InventoryModule: React.FC = () => {
  const { inventoryItems, assets, store } = useERP();

  const [activeTab, setActiveTab] = useState<'inventory' | 'assets'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Add Item Modal
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItem, setNewItem] = useState<{
    name: string;
    category: InventoryItem['category'];
    unit: InventoryItem['unit'];
    currentStock: number;
    reorderLevel: number;
    unitPrice: number;
    supplier: string;
  }>({
    name: '',
    category: 'Laboratory',
    unit: 'Boxes',
    currentStock: 50,
    reorderLevel: 20,
    unitPrice: 150,
    supplier: 'Apex Scientific Instruments'
  });

  // Add Asset Modal
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState<{
    name: string;
    category: AssetRecord['category'];
    location: string;
    purchaseDate: string;
    purchaseCost: number;
    condition: AssetRecord['condition'];
    assignedTo: string;
    warrantyExpiry: string;
  }>({
    name: '',
    category: 'IT Equipment',
    location: 'Smart Computer Lab 1',
    purchaseDate: new Date().toISOString().slice(0, 10),
    purchaseCost: 65000,
    condition: 'EXCELLENT',
    assignedTo: 'Head of IT & Systems',
    warrantyExpiry: '2028-05-30'
  });

  const lowStockCount = inventoryItems.filter(i => i.currentStock <= i.reorderLevel).length;

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredAssets = assets.filter(ast => {
    return (
      ast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ast.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ast.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ast.assignedTo && ast.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;

    store.addInventoryItem(newItem);
    setShowAddItemModal(false);
    setNewItem({
      name: '',
      category: 'Laboratory',
      unit: 'Boxes',
      currentStock: 50,
      reorderLevel: 20,
      unitPrice: 150,
      supplier: 'Apex Scientific Instruments'
    });
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name) return;

    store.addAsset(newAsset);
    setShowAddAssetModal(false);
    setNewAsset({
      name: '',
      category: 'IT Equipment',
      location: 'Smart Computer Lab 1',
      purchaseDate: new Date().toISOString().slice(0, 10),
      purchaseCost: 65000,
      condition: 'EXCELLENT',
      assignedTo: 'Head of IT & Systems',
      warrantyExpiry: '2028-05-30'
    });
  };

  return (
    <div id="inventory-module" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory & Fixed Asset Management</h1>
            {lowStockCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {lowStockCount} Low Stock Alert{lowStockCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Consumable school stock, lab chemicals, sports kits, and centralized fixed asset register
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {activeTab === 'inventory' ? (
            <button
              onClick={() => setShowAddItemModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock Item</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddAssetModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register Fixed Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Consumable Inventory ({inventoryItems.length})
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'assets'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fixed Asset Register ({assets.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder={activeTab === 'inventory' ? "Search by item name, code, supplier..." : "Search asset tag, name, location..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
          />
        </div>

        {activeTab === 'inventory' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Stationery">Stationery</option>
              <option value="Sports">Sports</option>
              <option value="Furniture">Furniture</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: CONSUMABLE INVENTORY */}
      {/* ============================================================ */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Item Name & Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Qty</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4">Unit Rate</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Restock / Issue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInventory.map(item => {
                  const isLow = item.currentStock <= item.reorderLevel;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono-tech">{item.itemCode}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono-tech font-bold text-slate-800 text-sm">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono-tech text-slate-500">
                        {item.reorderLevel} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono-tech">
                        ₹{item.unitPrice}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {item.supplier}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isLow ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => store.updateInventoryStock(item.id, 25, 'IN')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold transition"
                          title="Quick restock +25"
                        >
                          +25 Restock
                        </button>
                        {item.currentStock > 5 && (
                          <button
                            onClick={() => store.updateInventoryStock(item.id, 5, 'OUT')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                            title="Disburse -5 units"
                          >
                            -5 Issue
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: FIXED ASSET REGISTER */}
      {/* ============================================================ */}
      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(ast => (
            <div key={ast.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    {ast.assetTag}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ast.condition === 'EXCELLENT' ? 'bg-emerald-100 text-emerald-800' :
                    ast.condition === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                    ast.condition === 'NEEDS_REPAIR' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ast.condition}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-2.5">{ast.name}</h3>
                <div className="text-xs text-blue-600 font-semibold mt-0.5">{ast.category}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ast.location}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Capital Value:</span>
                  <span className="font-mono-tech font-bold text-slate-800">₹{ast.purchaseCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Commission Date:</span>
                  <span className="font-mono-tech">{ast.purchaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned To:</span>
                  <span className="font-medium text-slate-700">{ast.assignedTo || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Warranty:</span>
                  <span className="font-mono-tech text-slate-500">{ast.warrantyExpiry}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD INVENTORY ITEM */}
      {/* ============================================================ */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Register New Inventory Stock Item</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title / Description *</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. A4 Examination Answer Booklets"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                  >
                    <option value="Laboratory">Laboratory</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Sports">Sports</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Unit *</label>
                  <select
                    value={newItem.unit}
                    onChange={e => setNewItem({ ...newItem, unit: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Kg">Kg</option>
                    <option value="Sets">Sets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={newItem.currentStock}
                    onChange={e => setNewItem({ ...newItem, currentStock: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-mono-tech"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min={1}
                    value={newItem.reorderLevel}
                    onChange={e => setNewItem({ ...newItem, reorderLevel: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-mono-tech"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Rate (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newItem.unitPrice}
                    onChange={e => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-mono-tech"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vendor / Supplier</label>
                <input
                  type="text"
                  value={newItem.supplier}
                  onChange={e => setNewItem({ ...newItem, supplier: e.target.value })}
                  placeholder="e.g. Apex Scientific Instruments"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD ASSET */}
      {/* ============================================================ */}
      {showAddAssetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Register Institutional Fixed Asset</h3>
              <button onClick={() => setShowAddAssetModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Description *</label>
                <input
                  type="text"
                  required
                  value={newAsset.name}
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="e.g. 75-Inch 4K Interactive Flat Panel Display"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Category *</label>
                  <select
                    value={newAsset.category}
                    onChange={e => setNewAsset({ ...newAsset, category: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                  >
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Classroom Tech">Classroom Tech</option>
                    <option value="Vehicle">Vehicle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Installed Location *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.location}
                    onChange={e => setNewAsset({ ...newAsset, location: e.target.value })}
                    placeholder="e.g. Auditorium Audio Control Booth"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capital Cost (₹) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newAsset.purchaseCost}
                    onChange={e => setNewAsset({ ...newAsset, purchaseCost: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-mono-tech"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Condition *</label>
                  <select
                    value={newAsset.condition}
                    onChange={e => setNewAsset({ ...newAsset, condition: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                  >
                    <option value="EXCELLENT">Excellent (Brand New)</option>
                    <option value="GOOD">Good (Operational)</option>
                    <option value="NEEDS_REPAIR">Needs Repair / Servicing</option>
                    <option value="DAMAGED">Damaged / Write-off</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Custodian Personnel</label>
                  <input
                    type="text"
                    value={newAsset.assignedTo}
                    onChange={e => setNewAsset({ ...newAsset, assignedTo: e.target.value })}
                    placeholder="e.g. Lab In-Charge"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    value={newAsset.warrantyExpiry}
                    onChange={e => setNewAsset({ ...newAsset, warrantyExpiry: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-mono-tech"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
