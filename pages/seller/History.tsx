import React, { useEffect, useState } from 'react';
import { saleService } from '../../services/saleService';
import { Sale } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const SellerHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      saleService.getSales().then((data) => {
        // Filter sales by current user
        const mySales = data.filter(s => s.sellerId === user.id);
        setSales(mySales.reverse()); // Show newest first
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div>Carregando histórico...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Meu Histórico de Vendas</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhuma venda realizada.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Venda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.date).toLocaleDateString('pt-BR')} {new Date(sale.date).toLocaleTimeString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    #{sale.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.paymentMethod === 'CASH' ? 'Dinheiro' : 'Multicaixa'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.items.reduce((acc, item) => acc + item.quantity, 0)} itens
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(sale.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};