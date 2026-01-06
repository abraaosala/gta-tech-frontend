import React from 'react';
import { Sale } from '../types';

interface A4ReceiptProps {
    sale: Sale | null;
    settings?: { [key: string]: string };
}

export const A4Receipt = React.forwardRef<HTMLDivElement, A4ReceiptProps>(({ sale, settings }, ref) => {
    if (!sale) return null;

    const total = sale.total;
    // Sometimes total comes as string or number depending on backend, ensure number
    const totalValue = typeof total === 'string' ? parseFloat(total) : total;

    const companyName = settings?.['company_name'] || 'GTA - Tech';
    const tagLine = settings?.['hero_title'] || 'Soluções em Tecnologia';
    const address = settings?.['location_address'] || 'Endereço da Loja, 123 - Cidade/UF';
    const phone = settings?.['contact_phone'] || '(00) 1234-5678';

    return (
        <div ref={ref} className="p-10 font-sans" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', fontSize: '12pt' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{companyName}</h1>
                    <p className="text-gray-600">{tagLine}</p>
                    <p className="text-gray-500 text-sm mt-1">{address}</p>
                    <p className="text-gray-500 text-sm">Tel: {phone}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-semibold text-gray-800">Recibo de Venda</h2>
                    <p className="text-gray-500">#{sale.id}</p>
                    <p className="mt-2 text-sm text-gray-600">Data: {new Date(sale.date).toLocaleDateString('pt-BR')} {new Date(sale.date).toLocaleTimeString('pt-BR')}</p>
                </div>
            </div>

            {/* Customer Info */}
            <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1">Dados do Cliente</h3>
                {sale.customerName ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Nome:</p>
                            <p className="font-medium">{sale.customerName}</p>
                        </div>
                        {/* We might not have NIF/Phone in sale object directly unless we expanded it or fetched it. 
                             Assuming for now we only have what Sale interface has. If we need NIF, we need to update Sale interface and controller.
                             For now, let's show what we have.
                         */}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">Cliente não identificado (Consumidor Final)</p>
                )}
            </div>

            {/* Items Table */}
            <table className="w-full mb-8 border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-gray-700 text-sm">
                        <th className="py-2 px-3 text-left border-b border-gray-300">Item</th>
                        <th className="py-2 px-3 text-right border-b border-gray-300">Qtd</th>
                        <th className="py-2 px-3 text-right border-b border-gray-300">Preço Unit.</th>
                        <th className="py-2 px-3 text-right border-b border-gray-300">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 px-3">{item.name}</td>
                            <td className="py-2 px-3 text-right">{item.quantity}</td>
                            <td className="py-2 px-3 text-right">
                                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.price)}
                            </td>
                            <td className="py-2 px-3 text-right font-medium">
                                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.price * item.quantity)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-1/3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalValue)}
                        </span>
                    </div>
                    <div className="flex justify-between py-3 border-b-2 border-gray-800 text-lg font-bold text-gray-900 mt-2">
                        <span>TOTAL:</span>
                        <span>
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalValue)}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 text-sm text-gray-500 mt-2">
                        <span>Método de Pagamento:</span>
                        <span>{sale.paymentMethod === 'CASH' ? 'Dinheiro' : sale.paymentMethod === 'CARD' ? 'Multicaixa' : sale.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between py-1 text-sm text-gray-500">
                        <span>Vendedor:</span>
                        <span>{sale.sellerName}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm mt-auto pt-8 border-t border-gray-200">
                <p>Obrigado pela preferência!</p>
                <p className="text-xs mt-1">Este documento não serve como fatura fiscal oficial.</p>
            </div>
        </div>
    );
});

A4Receipt.displayName = 'A4Receipt';
