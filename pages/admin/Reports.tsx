import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { saleService } from '../../services/saleService';
import { productService } from '../../services/productService';
import { Sale, Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ReportPrint } from '../../components/ReportPrint';

type ReportTab = 'sales' | 'stock';

export const AdminReports = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros de Vendas
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtros de Estoque
  const [stockThreshold, setStockThreshold] = useState(100); // Aumentado para mostrar mais por padrão
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    Promise.all([
      saleService.getSales(),
      productService.getProducts(1, 1000) // Request more for report
    ])
      .then(([salesData, productsResponse]) => {
        setSales(salesData);
        setProducts(productsResponse.data); // Access the .data property
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading report data", err);
        setLoading(false);
      });
  }, []);

  // Lógica de Filtro de Vendas
  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      end.setHours(23, 59, 59, 999);
      return saleDate >= start && saleDate <= end;
    } else if (start) {
      return saleDate >= start;
    } else if (end) {
      end.setHours(23, 59, 59, 999);
      return saleDate <= end;
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSalesRevenue = filteredSales.reduce((acc, curr) => acc + curr.total, 0);

  // Lógica de Filtro de Estoque
  const filteredStock = products.filter((product) => {
    const matchesCategory = categoryFilter
      ? product.category.toLowerCase().includes(categoryFilter.toLowerCase())
      : true;
    const matchesThreshold = showOnlyLowStock ? product.stock <= stockThreshold : true;

    return matchesCategory && matchesThreshold;
  }).sort((a, b) => a.stock - b.stock);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Relatorio-${activeTab}-${new Date().toISOString().split('T')[0]}`,
  });

  // Prepare Data for Print
  const getPrintProps = () => {
    if (activeTab === 'sales') {
      return {
        title: 'Relatório de Vendas',
        summary: [
          { label: 'Período', value: `${startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'Início'} até ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Hoje'}` },
          { label: 'Total de Vendas', value: filteredSales.length },
          { label: 'Faturamento Total', value: new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalSalesRevenue) }
        ],
        headers: ['Data', 'Vendedor', 'Itens', 'Valor'],
        data: filteredSales.map(sale => [
          new Date(sale.date).toLocaleString('pt-BR'),
          sale.sellerName,
          sale.items.reduce((acc, i) => acc + i.quantity, 0).toString(),
          new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(sale.total)
        ])
      };
    } else {
      return {
        title: 'Relatório de Estoque',
        summary: [
          { label: 'Filtro Categoria', value: categoryFilter || 'Todas' },
          { label: 'Produtos', value: filteredStock.length },
          { label: 'Status', value: 'Baixo Estoque' }
        ],
        headers: ['Produto', 'Categoria', 'Estoque', 'Preço'],
        data: filteredStock.map(p => [
          p.name,
          p.category,
          p.stock.toString(),
          new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(p.price)
        ])
      };
    }
  };

  const printProps = getPrintProps();

  if (loading) return <div className="text-center p-10">Gerando relatórios...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Relatórios Gerenciais</h2>
        <Button onClick={handlePrint} variant="secondary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Imprimir Relatório
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'sales'
            ? 'border-b-2 border-indigo-600 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('sales')}
        >
          Vendas e Faturamento
        </button>
        <button
          className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'stock'
            ? 'border-b-2 border-indigo-600 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('stock')}
        >
          Controle de Estoque
        </button>
      </div>

      {/* Conteúdo da Aba Vendas */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Input
              label="Data Inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Data Final"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-center">
              <span className="block text-sm text-indigo-600 font-medium">Total no Período</span>
              <span className="text-xl font-bold text-indigo-800">
                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalSalesRevenue)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhuma venda encontrada neste período.</td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sale.date).toLocaleDateString('pt-BR')} {new Date(sale.date).toLocaleTimeString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {sale.sellerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {sale.items.reduce((acc, item) => acc + item.quantity, 0)} un.
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(sale.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba Estoque */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyLowStock}
                  onChange={(e) => setShowOnlyLowStock(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Apenas Baixo Estoque</span>
              </label>
              <Input
                label="Limiar de Alerta"
                type="number"
                disabled={!showOnlyLowStock}
                value={stockThreshold}
                onChange={(e) => setStockThreshold(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar Categoria</label>
              <select
                className="bg-white text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Todas as categorias</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-center">
              <span className="block text-sm text-orange-600 font-medium">Produtos em Alerta</span>
              <span className="text-xl font-bold text-orange-800">
                {filteredStock.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum produto com estoque baixo encontrado.</td>
                  </tr>
                ) : (
                  filteredStock.map((product) => {
                    const isCritical = product.stock === 0;
                    const isLow = product.stock <= 5;

                    return (
                      <tr key={product.id} className={isCritical ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isCritical ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              ESGOTADO
                            </span>
                          ) : isLow ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                              BAIXO
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div style={{ display: 'none' }}>
        <ReportPrint
          ref={componentRef}
          title={printProps.title}
          summary={printProps.summary}
          headers={printProps.headers}
          data={printProps.data}
        />
      </div>
    </div>
  );
};