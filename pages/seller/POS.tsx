import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { productService } from '../../services/productService';
import { saleService } from '../../services/saleService';
import { customerService } from '../../services/customerService';
import { settingsService } from '../../services/settingsService';
import Swal from 'sweetalert2';
import { Receipt } from '../../components/Receipt';
import { A4Receipt } from '../../components/A4Receipt';
import { Product, Sale, Customer } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const SellerPOS = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Customer State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', nif: '', phone: '', email: '', address: '' });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [settings, setSettings] = useState<{ [key: string]: string }>({});
  const [showTPADropdown, setShowTPADropdown] = useState(false);
  const [showA4Dropdown, setShowA4Dropdown] = useState(false);

  const { cart, addToCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, settingsResponse] = await Promise.all([
          productService.getProducts(1, 1000),
          settingsService.getPublicSettings()
        ]);
        setProducts(productsResponse.data);
        setSettings(settingsResponse);
      } catch (e) {
        console.error("Failed to load initial data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p =>
    p.stock > 0 && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.includes(searchTerm)
    )
  );

  // Customer Logic
  const handleSearchCustomer = async (query: string) => {
    setCustomerSearch(query);
    if (query.length > 1) {
      const results = await customerService.searchCustomers(query);
      setCustomerList(results);
    } else {
      setCustomerList([]);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name) return Swal.fire('Erro', 'Nome é obrigatório', 'error');
    try {
      const created = await customerService.createCustomer(newCustomer);
      setSelectedCustomer(created);
      setIsCreatingCustomer(false);
      setNewCustomer({ name: '', nif: '', phone: '', email: '', address: '' });
      Swal.fire('Sucesso', 'Cliente cadastrado!', 'success');
    } catch (e) {
      Swal.fire('Erro', 'Erro ao cadastrar cliente', 'error');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      Swal.fire('Erro', 'Usuário não autenticado. Por favor, faça login novamente.', 'error');
      return;
    }
    if (cart.length === 0) return;

    setProcessing(true);
    try {
      console.log('Sending sale payload:', {
        sellerId: user.id,
        sellerName: user.name,
        customerId: selectedCustomer?.id,
        items: cart,
        total: cartTotal,
        paymentMethod,
      });

      const newSale = await saleService.createSale({
        sellerId: user.id,
        sellerName: user.name, // Backend expects this? Controller maps it manually in index, but store uses what? Store ignores sellerName but uses sellerId
        customerId: selectedCustomer?.id,
        items: cart,
        total: cartTotal,
        paymentMethod,
      });

      // Inject customer name for display if available
      if (selectedCustomer) {
        newSale.customerName = selectedCustomer.name;
        newSale.customerNif = selectedCustomer.nif;
      }

      // Backend response for CREATE might not return sellerName or paymentMethod interpolated
      // So we preserve them from our local state to ensure they show on the receipt immediately
      newSale.sellerName = user.name;
      newSale.paymentMethod = paymentMethod;

      setLastSale(newSale);
      clearCart();
      setSelectedCustomer(null);

      Swal.fire({
        title: 'Venda Realizada!',
        text: `Venda #${newSale.id} concluída com sucesso.`,
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 3000
      });
    } catch (error: any) {
      console.error('Checkout Error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Erro desconhecido';
      const validationErrors = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join('\n')
        : '';

      Swal.fire({
        title: 'Erro!',
        text: `Erro ao processar venda:\n${validationErrors || errorMessage}`,
        icon: 'error',
        confirmButtonText: 'Fechar'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleNewSale = () => {
    setLastSale(null);
    setSelectedCustomer(null);
  };

  const componentRef = useRef<HTMLDivElement>(null);
  const componentRefA4 = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Recibo-${lastSale?.id || 'venda'}`,
  });

  const handlePrintA4 = useReactToPrint({
    contentRef: componentRefA4,
    documentTitle: `Fatura-${lastSale?.id || 'venda'}`,
  });

  const printReceipt = () => {
    if (lastSale) handlePrint();
  };

  const printA4 = () => {
    if (lastSale) handlePrintA4();
  };

  // Helper to capture component in a clean isolated environment
  const captureInIsolation = async (Component: React.ElementType, props: any, format: 'tpa' | 'a4') => {
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.border = 'none';
    iframe.style.width = format === 'tpa' ? '350px' : '230mm'; // More width to be safe
    iframe.style.height = format === 'tpa' ? '1000px' : '297mm';
    document.body.appendChild(iframe);

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error('Cannot access iframe document');

      // Write basic HTML structure WITHOUT ANY GLOBAL STYLES
      doc.open();
      doc.write(`
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; background: white; font-family: sans-serif; }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body><div id="root"></div></body>
        </html>
      `);
      doc.close();

      // We need to render the React component into this new environment
      // Since it's a separate document, we can't easily share the existing React root context
      // But passing props is enough for Receipt components (they are stateless display comps)

      // Use createRoot from the main React instance but target the iframe's node
      // Wait for it to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const rootEl = doc.getElementById('root');
      if (rootEl) {
        // We need to import createRoot dynamically or use the one we have
        // Since we are in the same bundle, we can use ReactDOM from 'react-dom/client'
        const { createRoot } = await import('react-dom/client');
        const root = createRoot(rootEl);

        // Wrap in a promise to wait for render? createRoot is async but doesn't return promise
        // We'll rely on a small timeout or flushSync if possible, but flushSync is discouraged for root
        root.render(<Component {...props} />);

        // Wait for images and render
        await new Promise(resolve => setTimeout(resolve, 500));

        // Now capture the BODY of the iframe
        const canvas = await html2canvas(doc.body, {
          scale: 3,
          useCORS: true,
          logging: false, // Turn off logging to reduce noise
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');

        if (format === 'tpa') {
          const imgWidth = 80;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, Math.max(imgHeight, 100)]
          });
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          pdf.save(`recibo-${props.sale.id.slice(0, 8)}.pdf`);
        } else {
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          pdf.save(`fatura-${props.sale.id.slice(0, 8)}.pdf`);
        }

        // Cleanup React root
        root.unmount();
      }
    } catch (error: any) {
      console.error('Isolation print error:', error);
      throw error;
    } finally {
      document.body.removeChild(iframe);
    }
  };

  const downloadReceiptPDF = () => {
    if (!lastSale) return;
    captureInIsolation(Receipt, { sale: lastSale, settings }, 'tpa')
      .catch(err => Swal.fire('Erro', 'Falha ao gerar PDF isolated: ' + err.message, 'error'));
  };

  const downloadA4PDF = () => {
    if (!lastSale) return;
    captureInIsolation(A4Receipt, { sale: lastSale, settings }, 'a4')
      .catch(err => Swal.fire('Erro', 'Falha ao gerar PDF isolated: ' + err.message, 'error'));
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 relative">
      {/* Product List */}
      <div className="flex-1 flex flex-col">
        {/* ... (Existing search input) */}
        <div className="mb-6">
          <Input
            placeholder="Buscar produto por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-lg py-3"
            disabled={!!lastSale}
          />
        </div>

        {loading ? (
          <div className="text-center p-10">Carregando catálogo...</div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4 ${lastSale ? 'opacity-50 pointer-events-none' : ''}`}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow flex flex-col"
                onClick={() => addToCart(product)}
              >
                {/* ... (Existing Product Card) */}
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="h-32 w-full object-contain mb-3" />
                )}
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="font-bold text-lg text-indigo-600">
                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(product.price)}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Est: {product.stock}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-[calc(100vh-100px)] sticky top-4">
        {/* ... (Existing Header) */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h2 className="font-bold text-xl text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            {lastSale ? 'Venda Finalizada' : 'Carrinho Atual'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ... (Existing Cart/Success content) */}
          {lastSale ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Venda Realizada!</h3>
                <p className="text-sm text-gray-500">ID: #{lastSale.id}</p>
                <p className="text-xl font-bold text-indigo-600 mt-2">
                  {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(lastSale.total)}
                </p>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">Carrinho vazio</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                {/* ... (Existing Item) */}
                <div className="flex-1">
                  <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.price)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }} className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-600 hover:bg-gray-300">-</button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }} className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-600 hover:bg-gray-300">+</button>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} className="ml-3 text-red-500 hover:text-red-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          {lastSale ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {/* TPA Dropdown */}
                <div className="relative">
                  <Button className="w-full" onClick={() => setShowTPADropdown(!showTPADropdown)} variant="secondary">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    TPA
                  </Button>
                  {showTPADropdown && (
                    <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button onClick={() => { printReceipt(); setShowTPADropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-t-lg flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Imprimir
                      </button>
                      <button onClick={() => { downloadReceiptPDF(); setShowTPADropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-b-lg flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        Salvar PDF
                      </button>
                    </div>
                  )}
                </div>
                {/* A4 Dropdown */}
                <div className="relative">
                  <Button className="w-full" onClick={() => setShowA4Dropdown(!showA4Dropdown)} variant="secondary">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    A4
                  </Button>
                  {showA4Dropdown && (
                    <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button onClick={() => { printA4(); setShowA4Dropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-t-lg flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Imprimir
                      </button>
                      <button onClick={() => { downloadA4PDF(); setShowA4Dropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-b-lg flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        Salvar PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Button className="w-full py-3" onClick={handleNewSale}>
                Nova Venda
              </Button>
            </div>
          ) : (
            <>
              {/* Customer Selection Button */}
              <div className="mb-4">
                {!selectedCustomer ? (
                  <button onClick={() => setIsCustomerModalOpen(true)} className="w-full py-2 border border-dashed border-gray-400 text-gray-600 rounded hover:bg-gray-100 flex items-center justify-center group">
                    <svg className="w-5 h-5 mr-2 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Adicionar Cliente (Opcional)
                  </button>
                ) : (
                  <div className="flex justify-between items-center bg-indigo-50 p-2 rounded border border-indigo-200">
                    <div>
                      <p className="text-xs text-indigo-500 font-bold">Cliente</p>
                      <p className="text-sm font-medium text-indigo-900">{selectedCustomer.name}</p>
                    </div>
                    <button onClick={() => setSelectedCustomer(null)} className="text-red-500 hover:text-red-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                )}
              </div>

              {/* ... (Existing totals and Payment) */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Total</span>
                <span className="text-2xl font-bold text-indigo-700">
                  {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(cartTotal)}
                </span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`py-2 px-4 rounded border text-sm font-medium ${paymentMethod === 'CASH' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Dinheiro
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`py-2 px-4 rounded border text-sm font-medium ${paymentMethod === 'CARD' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Multicaixa
                  </button>
                </div>
              </div>

              <Button
                className="w-full py-3 text-lg"
                onClick={handleCheckout}
                disabled={cart.length === 0 || processing}
                isLoading={processing}
              >
                Finalizar Venda
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hidden Print Components - Using off-screen rendering instead of display:none for better html2canvas support */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0 }}>
        <div ref={componentRef}>
          <Receipt sale={lastSale} settings={settings} />
        </div>
        <div ref={componentRefA4}>
          <A4Receipt sale={lastSale} settings={settings} />
        </div>
      </div>

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Selecionar Cliente</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {!isCreatingCustomer ? (
              <div className="p-4">
                <Input
                  placeholder="Buscar por nome, NIF ou telefone..."
                  value={customerSearch}
                  onChange={(e) => handleSearchCustomer(e.target.value)}
                  className="mb-4"
                  autoFocus
                />

                <div className="max-h-60 overflow-y-auto mb-4 border rounded border-gray-100 divide-y divide-gray-100">
                  {customerList.length > 0 ? (
                    customerList.map(cust => (
                      <div key={cust.id} onClick={() => { setSelectedCustomer(cust); setIsCustomerModalOpen(false); }} className="p-3 hover:bg-indigo-50 cursor-pointer transition-colors">
                        <div className="font-medium text-gray-800">{cust.name}</div>
                        <div className="text-sm text-gray-500">{cust.phone || cust.nif || 'Sem contato'}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      {customerSearch ? 'Nenhum cliente encontrado' : 'Digite para buscar...'}
                    </div>
                  )}
                </div>

                <Button onClick={() => setIsCreatingCustomer(true)} variant="secondary" className="w-full">
                  + Novo Cliente
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <Input placeholder="Nome Completo *" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                <Input placeholder="NIF" value={newCustomer.nif} onChange={e => setNewCustomer({ ...newCustomer, nif: e.target.value })} />
                <Input placeholder="Telefone" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                <Input placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                <Input placeholder="Endereço" value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} />

                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setIsCreatingCustomer(false)} variant="secondary" className="w-1/2">Voltar</Button>
                  <Button onClick={handleCreateCustomer} className="w-1/2">Cadastrar</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};