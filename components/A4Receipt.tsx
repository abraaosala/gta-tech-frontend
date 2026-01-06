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
    const address = settings?.['location_address'] || 'Ao lado da Escola de condução EBJ, Cabassango';
    const phone = settings?.['contact_phone'] || '(249) 946 763 011';

    return (
        <div ref={ref} style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '2.5rem', fontFamily: 'sans-serif', fontSize: '12pt', backgroundColor: '#ffffff', color: '#111827' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1f2937', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{companyName}</h1>
                    <p style={{ color: '#4b5563', margin: 0 }}>{tagLine}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>{address}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Tel: {phone}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>Recibo de Venda</h2>
                    <p style={{ color: '#6b7280', margin: 0 }}>#{sale.id}</p>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>Data: {new Date(sale.date).toLocaleDateString('pt-BR')} {new Date(sale.date).toLocaleTimeString('pt-BR')}</p>
                </div>
            </div>

            {/* Customer Info */}
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem', margin: 0 }}>Dados do Cliente</h3>
                {sale.customerName ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Nome:</p>
                            <p style={{ fontWeight: '500', margin: 0 }}>{sale.customerName}</p>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>Cliente não identificado (Consumidor Final)</p>
                )}
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }}>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #d1d5db' }}>Item</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', borderBottom: '1px solid #d1d5db' }}>Qtd</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', borderBottom: '1px solid #d1d5db' }}>Preço Unit.</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', borderBottom: '1px solid #d1d5db' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '0.5rem 0.75rem' }}>{item.name}</td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>{item.quantity}</td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.price)}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '500' }}>
                                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.price * item.quantity)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
                <div style={{ width: '33.333333%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#4b5563' }}>Subtotal:</span>
                        <span style={{ fontWeight: '500' }}>
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalValue)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '2px solid #1f2937', fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginTop: '0.5rem' }}>
                        <span>TOTAL:</span>
                        <span>
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalValue)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        <span>Método de Pagamento:</span>
                        <span>{sale.paymentMethod === 'CASH' ? 'Dinheiro' : sale.paymentMethod === 'CARD' ? 'Multicaixa' : sale.paymentMethod}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                        <span>Vendedor:</span>
                        <span>{sale.sellerName}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ margin: 0 }}>Obrigado pela preferência!</p>
            </div>
        </div>
    );
});

A4Receipt.displayName = 'A4Receipt';
