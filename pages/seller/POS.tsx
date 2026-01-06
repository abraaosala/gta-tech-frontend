import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { productService } from '../../services/productService';
import { saleService } from '../../services/saleService';
import Swal from 'sweetalert2';
import { Receipt } from '../../components/Receipt';
import { Product, Sale } from '../../types';
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

  const { cart, addToCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    // Requests a large number of products for POS client-side search
    // In a real large-scale app, we should implement server-side search
    productService.getProducts(1, 1000).then((response) => {
      setProducts(response.data);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.includes(searchTerm)
  );

  const handleCheckout = async () => {
    if (cart.length === 0 || !user) return;


    setProcessing(true);
    try {
      const newSale = await saleService.createSale({
        sellerId: user.id,
        sellerName: user.name,
        items: cart,
        total: cartTotal,
        paymentMethod,
      });

      setLastSale(newSale);
      clearCart();

      Swal.fire({
        title: 'Venda Realizada!',
        text: `Venda #${newSale.id} concluída com sucesso.`,
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 3000
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      // Laravel validation errors often come in 'errors' object
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
  };

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Updated for newer versions, check version. If older use content: () => componentRef.current
    documentTitle: `Recibo-${lastSale?.id || 'venda'}`,
  });

  const printReceipt = () => {
    if (lastSale) {
      handlePrint();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Product List */}
      <div className="flex-1 flex flex-col">
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
        <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h2 className="font-bold text-xl text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            {lastSale ? 'Venda Finalizada' : 'Carrinho Atual'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              <Button className="w-full py-3" onClick={printReceipt} variant="secondary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Imprimir Nota Fiscal
              </Button>
              <Button className="w-full py-3" onClick={handleNewSale}>
                Nova Venda
              </Button>
            </div>
          ) : (
            <>
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
      <div style={{ display: 'none' }}>
        <Receipt ref={componentRef} sale={lastSale} />
      </div>
    </div>
  );
};