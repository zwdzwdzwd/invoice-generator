import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Download, Plus, Save, Trash2, RotateCcw, X } from 'lucide-react';
import { initialData } from './initialData';

function App() {
  // --- 状态管理 ---
  // 数据源（从localStorage加载或使用默认值）
  const [payees, setPayees] = useState(() => JSON.parse(localStorage.getItem('payees')) || initialData.payees);
  const [wireAccounts, setWireAccounts] = useState(() => JSON.parse(localStorage.getItem('wireAccounts')) || initialData.wireAccounts);
  const [cryptoAccounts, setCryptoAccounts] = useState(() => JSON.parse(localStorage.getItem('cryptoAccounts')) || initialData.cryptoAccounts);
  const [clients, setClients] = useState(() => JSON.parse(localStorage.getItem('clients')) || initialData.clients);

  // 当前发票的选中项/输入项
  const [selectedPayeeId, setSelectedPayeeId] = useState(payees[0]?.id);
  const [paymentMethod, setPaymentMethod] = useState('wire'); // 'wire' | 'crypto'
  const [selectedWireId, setSelectedWireId] = useState(wireAccounts[0]?.id);
  const [selectedCryptoId, setSelectedCryptoId] = useState(cryptoAccounts[0]?.id);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id);
  
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('marketing service');

  // --- 自动编号逻辑 ---
  useEffect(() => {
    const generateInvoiceNum = () => {
      const todayStr = invoiceDate.replace(/-/g, ''); // 20260119
      const storedLastDate = localStorage.getItem('lastInvoiceDate');
      let dailyCounter = parseInt(localStorage.getItem('dailyCounter') || '0', 10);

      if (storedLastDate === todayStr) {
        if (!invoiceNumber) {
             const nextNum = dailyCounter + 1;
             return `${todayStr}${String(nextNum).padStart(3, '0')}`;
        }
      } else {
        // 新的一天
        return `${todayStr}001`;
      }
      return invoiceNumber;
    };

    setInvoiceNumber(generateInvoiceNum());
  }, [invoiceDate]);

  // --- 持久化保存 ---
  useEffect(() => {
    localStorage.setItem('payees', JSON.stringify(payees));
    localStorage.setItem('wireAccounts', JSON.stringify(wireAccounts));
    localStorage.setItem('cryptoAccounts', JSON.stringify(cryptoAccounts));
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [payees, wireAccounts, cryptoAccounts, clients]);

  // --- 获取当前选中对象 ---
  const currentPayee = payees.find(p => p.id === selectedPayeeId) || {};
  const currentWire = wireAccounts.find(a => a.id === selectedWireId) || {};
  const currentCrypto = cryptoAccounts.find(a => a.id === selectedCryptoId) || {};
  const currentClient = clients.find(c => c.id === selectedClientId) || {};

  // --- PDF 下载 ---
  const handleDownload = () => {
    const element = document.getElementById('invoice-preview');
    const opt = {
      margin: 0, // 强制 0 边距
      filename: `Invoice_${invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      const todayStr = invoiceDate.replace(/-/g, '');
      const storedLastDate = localStorage.getItem('lastInvoiceDate');
      let currentCount = 0;
      if (storedLastDate === todayStr) {
        currentCount = parseInt(localStorage.getItem('dailyCounter') || '0', 10);
      }
      const currentNumSuffix = parseInt(invoiceNumber.slice(-3));
      if (currentNumSuffix > currentCount) {
          localStorage.setItem('lastInvoiceDate', todayStr);
          localStorage.setItem('dailyCounter', currentNumSuffix.toString());
      }
    });
  };

  // --- 新增数据逻辑 ---
  const [isAddingPayee, setIsAddingPayee] = useState(false);
  const [newPayeeForm, setNewPayeeForm] = useState({ alias: '', name: '', address_line1: '', address_line2: '', zip: '', email: '' });

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientForm, setNewClientForm] = useState({ alias: '', name: '', address: '', reg: '', vat: '' });

  const [isAddingWire, setIsAddingWire] = useState(false);
  const [newWireForm, setNewWireForm] = useState({ alias: '', label: '', bankName: '', accountName: '', accountNumber: '', swiftCode: '', bankAddress: '', bankCode: '', branchCode: '' });

  const [isAddingCrypto, setIsAddingCrypto] = useState(false);
  const [newCryptoForm, setNewCryptoForm] = useState({ alias: '', label: '', network: 'TRC20', currency: 'USDT', address: '' });

  const handleAddPayee = () => {
    if (!newPayeeForm.name) return;
    const newId = `payee_${Date.now()}`;
    const newPayee = {
        id: newId,
        alias: newPayeeForm.alias,
        name: newPayeeForm.name,
        address_line1: newPayeeForm.address_line1,
        address_line2: newPayeeForm.address_line2,
        zip: newPayeeForm.zip,
        email: newPayeeForm.email
    };
    setPayees([...payees, newPayee]);
    setSelectedPayeeId(newId);
    setIsAddingPayee(false);
    setNewPayeeForm({ alias: '', name: '', address_line1: '', address_line2: '', zip: '', email: '' });
  };

  const handleAddClient = () => {
    if (!newClientForm.name) return;
    const newId = `client_${Date.now()}`;
    const newClient = {
        id: newId,
        alias: newClientForm.alias,
        name: newClientForm.name,
        address: newClientForm.address,
        regNumber: newClientForm.reg,
        vat: newClientForm.vat,
        director: '',
        website: ''
    };
    setClients([...clients, newClient]);
    setSelectedClientId(newId);
    setIsAddingClient(false);
    setNewClientForm({ alias: '', name: '', address: '', reg: '', vat: '' });
  };

  const handleAddWire = () => {
      if (!newWireForm.accountNumber) return;
      const newId = `wire_${Date.now()}`;
      const newWire = {
          id: newId,
          alias: newWireForm.alias,
          label: newWireForm.label || newWireForm.bankName,
          accountName: newWireForm.accountName,
          accountNumber: newWireForm.accountNumber,
          bankName: newWireForm.bankName,
          swiftCode: newWireForm.swiftCode,
          bankAddress: newWireForm.bankAddress,
          bankCode: newWireForm.bankCode,
          branchCode: newWireForm.branchCode,
          region: ''
      };
      setWireAccounts([...wireAccounts, newWire]);
      setSelectedWireId(newId);
      setIsAddingWire(false);
      setNewWireForm({ alias: '', label: '', bankName: '', accountName: '', accountNumber: '', swiftCode: '', bankAddress: '', bankCode: '', branchCode: '' });
  };

  const handleAddCrypto = () => {
      if (!newCryptoForm.address) return;
      const newId = `crypto_${Date.now()}`;
      const newCrypto = {
          id: newId,
          alias: newCryptoForm.alias,
          label: newCryptoForm.label || `${newCryptoForm.currency} ${newCryptoForm.network}`,
          network: newCryptoForm.network,
          currency: newCryptoForm.currency,
          address: newCryptoForm.address
      };
      setCryptoAccounts([...cryptoAccounts, newCrypto]);
      setSelectedCryptoId(newId);
      setIsAddingCrypto(false);
      setNewCryptoForm({ alias: '', label: '', network: 'TRC20', currency: 'USDT', address: '' });
  };


  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* 左侧操作面板 (不打印) */}
      <div className="w-full md:w-1/3 bg-white border-r border-slate-200 p-6 overflow-y-auto no-print h-screen sticky top-0">
        <h1 className="text-2xl font-bold text-indigo-600 mb-6 flex items-center gap-2">
          <RotateCcw size={24} /> Invoice Generator
        </h1>

        <div className="space-y-6">
          {/* 1. 收款方 */}
          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Payee (From)</label>
                <button 
                    onClick={() => setIsAddingPayee(!isAddingPayee)}
                    className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                >
                    {isAddingPayee ? <X size={12}/> : <Plus size={12}/>} {isAddingPayee ? 'Cancel' : 'Add New'}
                </button>
            </div>

            {isAddingPayee && (
                <div className="bg-slate-50 p-3 rounded-md mb-2 border border-slate-200 text-sm space-y-2">
                    <input placeholder="Internal Alias (e.g. Clickbook HK)" className="w-full border p-1 rounded font-bold" value={newPayeeForm.alias} onChange={e => setNewPayeeForm({...newPayeeForm, alias: e.target.value})} />
                    <input placeholder="Company Name" className="w-full border p-1 rounded" value={newPayeeForm.name} onChange={e => setNewPayeeForm({...newPayeeForm, name: e.target.value})} />
                    <input placeholder="Address Line 1" className="w-full border p-1 rounded" value={newPayeeForm.address_line1} onChange={e => setNewPayeeForm({...newPayeeForm, address_line1: e.target.value})} />
                    <input placeholder="Address Line 2" className="w-full border p-1 rounded" value={newPayeeForm.address_line2} onChange={e => setNewPayeeForm({...newPayeeForm, address_line2: e.target.value})} />
                    <div className="flex gap-2">
                        <input placeholder="ZIP / Postcode" className="w-1/3 border p-1 rounded" value={newPayeeForm.zip} onChange={e => setNewPayeeForm({...newPayeeForm, zip: e.target.value})} />
                        <input placeholder="Email" className="w-2/3 border p-1 rounded" value={newPayeeForm.email} onChange={e => setNewPayeeForm({...newPayeeForm, email: e.target.value})} />
                    </div>
                    <button onClick={handleAddPayee} className="w-full bg-indigo-600 text-white py-1 rounded hover:bg-indigo-700">Save Payee</button>
                </div>
            )}

            <select 
              value={selectedPayeeId} 
              onChange={(e) => setSelectedPayeeId(e.target.value)}
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border"
            >
              {payees.map(p => (
                <option key={p.id} value={p.id}>
                    {p.alias ? `【${p.alias}】 ` : ''}{p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. 付款方 */}
          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Client (Bill To)</label>
                <button 
                    onClick={() => setIsAddingClient(!isAddingClient)}
                    className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                >
                    {isAddingClient ? <X size={12}/> : <Plus size={12}/>} {isAddingClient ? 'Cancel' : 'Add New'}
                </button>
            </div>
            
            {isAddingClient && (
                <div className="bg-slate-50 p-3 rounded-md mb-2 border border-slate-200 text-sm space-y-2">
                    <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs text-yellow-700 mb-2">
                        Internal Alias is for your reference only.
                    </div>
                    <input placeholder="Internal Alias (e.g. 360)" className="w-full border p-1 rounded font-bold" value={newClientForm.alias} onChange={e => setNewClientForm({...newClientForm, alias: e.target.value})} />
                    <input placeholder="Company Name" className="w-full border p-1 rounded" value={newClientForm.name} onChange={e => setNewClientForm({...newClientForm, name: e.target.value})} />
                    <textarea placeholder="Address" rows="2" className="w-full border p-1 rounded" value={newClientForm.address} onChange={e => setNewClientForm({...newClientForm, address: e.target.value})} />
                    <input placeholder="Reg No." className="w-full border p-1 rounded" value={newClientForm.reg} onChange={e => setNewClientForm({...newClientForm, reg: e.target.value})} />
                    <input placeholder="VAT (Optional)" className="w-full border p-1 rounded" value={newClientForm.vat} onChange={e => setNewClientForm({...newClientForm, vat: e.target.value})} />
                    <button onClick={handleAddClient} className="w-full bg-indigo-600 text-white py-1 rounded hover:bg-indigo-700">Save Client</button>
                </div>
            )}

            <select 
              value={selectedClientId} 
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full border-slate-300 rounded-md shadow-sm p-2 border"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                    {c.alias ? `【${c.alias}】 ` : ''}{c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. 收款账号 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
            <div className="flex gap-2 mb-2">
              <button 
                onClick={() => setPaymentMethod('wire')}
                className={`flex-1 py-2 text-sm rounded-md border ${paymentMethod === 'wire' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-300'}`}
              >
                Wire Transfer
              </button>
              <button 
                onClick={() => setPaymentMethod('crypto')}
                className={`flex-1 py-2 text-sm rounded-md border ${paymentMethod === 'crypto' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-300'}`}
              >
                Crypto
              </button>
            </div>
            
            {/* Wire Selection & Add */}
            {paymentMethod === 'wire' && (
                <>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-500">Select Account</span>
                        <button 
                            onClick={() => setIsAddingWire(!isAddingWire)}
                            className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                        >
                            {isAddingWire ? <X size={12}/> : <Plus size={12}/>} Add Wire
                        </button>
                    </div>

                    {isAddingWire && (
                        <div className="bg-slate-50 p-3 rounded-md mb-2 border border-slate-200 text-sm space-y-2">
                            <input placeholder="Internal Alias (e.g. WD)" className="w-full border p-1 rounded font-bold" value={newWireForm.alias} onChange={e => setNewWireForm({...newWireForm, alias: e.target.value})} />
                            <input placeholder="Display Label (e.g. HSBC HK)" className="w-full border p-1 rounded" value={newWireForm.label} onChange={e => setNewWireForm({...newWireForm, label: e.target.value})} />
                            <input placeholder="Bank Name" className="w-full border p-1 rounded" value={newWireForm.bankName} onChange={e => setNewWireForm({...newWireForm, bankName: e.target.value})} />
                            <input placeholder="Account Name" className="w-full border p-1 rounded" value={newWireForm.accountName} onChange={e => setNewWireForm({...newWireForm, accountName: e.target.value})} />
                            <input placeholder="Account Number" className="w-full border p-1 rounded" value={newWireForm.accountNumber} onChange={e => setNewWireForm({...newWireForm, accountNumber: e.target.value})} />
                            <input placeholder="SWIFT Code" className="w-full border p-1 rounded" value={newWireForm.swiftCode} onChange={e => setNewWireForm({...newWireForm, swiftCode: e.target.value})} />
                            <textarea placeholder="Bank Address" rows="2" className="w-full border p-1 rounded" value={newWireForm.bankAddress} onChange={e => setNewWireForm({...newWireForm, bankAddress: e.target.value})} />
                            <div className="flex gap-2">
                                <input placeholder="Bank Code" className="w-1/2 border p-1 rounded" value={newWireForm.bankCode} onChange={e => setNewWireForm({...newWireForm, bankCode: e.target.value})} />
                                <input placeholder="Branch Code" className="w-1/2 border p-1 rounded" value={newWireForm.branchCode} onChange={e => setNewWireForm({...newWireForm, branchCode: e.target.value})} />
                            </div>
                            <button onClick={handleAddWire} className="w-full bg-indigo-600 text-white py-1 rounded hover:bg-indigo-700">Save Wire Account</button>
                        </div>
                    )}

                    <select 
                        value={selectedWireId} 
                        onChange={(e) => setSelectedWireId(e.target.value)}
                        className="w-full border-slate-300 rounded-md shadow-sm p-2 border"
                    >
                        {wireAccounts.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.alias ? `【${a.alias}】 ` : ''}{a.label}
                            </option>
                        ))}
                    </select>
                </>
            )}

            {/* Crypto Selection & Add */}
            {paymentMethod === 'crypto' && (
                <>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-500">Select Wallet</span>
                        <button 
                            onClick={() => setIsAddingCrypto(!isAddingCrypto)}
                            className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                        >
                            {isAddingCrypto ? <X size={12}/> : <Plus size={12}/>} Add Crypto
                        </button>
                    </div>

                    {isAddingCrypto && (
                        <div className="bg-slate-50 p-3 rounded-md mb-2 border border-slate-200 text-sm space-y-2">
                            <input placeholder="Internal Alias (e.g. AD)" className="w-full border p-1 rounded font-bold" value={newCryptoForm.alias} onChange={e => setNewCryptoForm({...newCryptoForm, alias: e.target.value})} />
                            <input placeholder="Display Label (e.g. USDT TRC20)" className="w-full border p-1 rounded" value={newCryptoForm.label} onChange={e => setNewCryptoForm({...newCryptoForm, label: e.target.value})} />
                            <div className="flex gap-2">
                                <input placeholder="Currency (e.g. USDT)" className="w-1/2 border p-1 rounded" value={newCryptoForm.currency} onChange={e => setNewCryptoForm({...newCryptoForm, currency: e.target.value})} />
                                <input placeholder="Network (e.g. TRC20)" className="w-1/2 border p-1 rounded" value={newCryptoForm.network} onChange={e => setNewCryptoForm({...newCryptoForm, network: e.target.value})} />
                            </div>
                            <input placeholder="Wallet Address" className="w-full border p-1 rounded" value={newCryptoForm.address} onChange={e => setNewCryptoForm({...newCryptoForm, address: e.target.value})} />
                            <button onClick={handleAddCrypto} className="w-full bg-indigo-600 text-white py-1 rounded hover:bg-indigo-700">Save Wallet</button>
                        </div>
                    )}

                    <select 
                        value={selectedCryptoId} 
                        onChange={(e) => setSelectedCryptoId(e.target.value)}
                        className="w-full border-slate-300 rounded-md shadow-sm p-2 border"
                    >
                        {cryptoAccounts.map(a => (
                        <option key={a.id} value={a.id}>
                            {a.alias ? `【${a.alias}】 ` : ''}{a.label} ({a.network})
                        </option>
                        ))}
                    </select>
                </>
            )}
          </div>

          {/* 4. 发票详情 */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div>
                <label className="block text-xs font-medium text-slate-500">Invoice No.</label>
                <input 
                    type="text" 
                    value={invoiceNumber} 
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full border-slate-300 rounded p-1" 
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-500">Date</label>
                <input 
                    type="date" 
                    value={invoiceDate} 
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full border-slate-300 rounded p-1" 
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-500">Amount (USD)</label>
                <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border-slate-300 rounded p-1 text-lg font-bold text-indigo-600" 
                />
            </div>
          </div>

          {/* 6. 下载按钮 */}
          <button 
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg shadow hover:bg-indigo-700 transition-colors"
          >
            <Download size={20} /> Download PDF
          </button>
        </div>
      </div>

      {/* 右侧预览区 (A4) */}
      <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex justify-center">
        <div id="invoice-preview" className="invoice-a4 relative text-slate-800 text-sm">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">INVOICE</h1>
                    <div className="text-slate-500">
                        <p>Invoice No: <span className="text-slate-900 font-medium">#{invoiceNumber}</span></p>
                        <p>Date: <span className="text-slate-900 font-medium">{invoiceDate}</span></p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="font-bold text-lg text-indigo-900">{currentPayee.name}</h2>
                    <p className="whitespace-pre-line text-slate-500 leading-tight">
                        {currentPayee.address_line1}<br/>
                        {currentPayee.address_line2}<br/>
                        {currentPayee.zip}
                    </p>
                    <p className="text-indigo-600 mt-1">{currentPayee.email}</p>
                </div>
            </div>

            {/* Bill To */}
            <div className="mb-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h2 className="font-bold text-lg text-slate-900">{currentClient.name}</h2>
                    <p className="text-slate-600 whitespace-pre-line">{currentClient.address}</p>
                    {currentClient.regNumber && <p className="text-slate-500 mt-2">Reg No: {currentClient.regNumber}</p>}
                    {currentClient.vat && <p className="text-slate-500">VAT: {currentClient.vat}</p>}
                    {currentClient.director && <p className="text-slate-500">Director: {currentClient.director}</p>}
                </div>
            </div>

            {/* Table */}
            <table className="w-full mb-10">
                <thead>
                    <tr className="bg-slate-800 text-white">
                        <th className="py-3 px-4 text-left rounded-l">Description</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Rate</th>
                        <th className="py-3 px-4 text-right rounded-r">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-slate-100">
                        <td className="py-4 px-4 font-medium">{description}</td>
                        <td className="py-4 px-4 text-center">1</td>
                        <td className="py-4 px-4 text-right">${amount || '0.00'}</td>
                        <td className="py-4 px-4 text-right font-bold">${amount || '0.00'}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="3" className="pt-4 text-right font-bold text-slate-500">Total</td>
                        <td className="pt-4 text-right font-bold text-2xl text-indigo-600">${amount || '0.00'}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Payment Details */}
            <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Payment Details</h3>
                
                {paymentMethod === 'wire' ? (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div className="text-slate-500">Bank Name:</div>
                        <div className="font-medium">{currentWire.bankName}</div>
                        
                        <div className="text-slate-500">Account Name:</div>
                        <div className="font-medium">{currentWire.accountName}</div>
                        
                        <div className="text-slate-500">Account Number:</div>
                        <div className="font-medium">{currentWire.accountNumber}</div>
                        
                        <div className="text-slate-500">SWIFT Code:</div>
                        <div className="font-medium">{currentWire.swiftCode}</div>
                        
                        <div className="text-slate-500">Bank Address:</div>
                        <div className="font-medium">{currentWire.bankAddress}</div>
                        
                        <div className="text-slate-500">Bank/Branch Code:</div>
                        <div className="font-medium">{currentWire.bankCode} / {currentWire.branchCode}</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <span className="text-slate-500">Network:</span> <span className="font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">{currentCrypto.network}</span>
                        </div>
                        <div>
                            <div className="text-slate-500 mb-1">Wallet Address ({currentCrypto.currency}):</div>
                            <div className="font-mono bg-white border border-slate-200 p-3 rounded break-all select-all">{currentCrypto.address}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Sign */}
            <div className="absolute bottom-20 left-20 right-20 text-center border-t border-slate-100 pt-8 text-slate-400 text-xs">
                <p>Thank you for your business.</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
