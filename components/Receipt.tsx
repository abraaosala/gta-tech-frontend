import React from 'react';
import { Sale } from '../types';

interface ReceiptProps {
    sale: Sale | null;
    settings?: { [key: string]: string };
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ sale, settings }, ref) => {
    if (!sale) return null;

    const companyName = settings?.['company_name'] || 'GTA - Tech';
    const tagLine = settings?.['hero_title'] || 'Soluções em Tecnologia';

    return (
        <div ref={ref} className="p-4" style={{ width: '80mm', fontFamily: 'Courier New, monospace', fontSize: '12px', color: '#000000', backgroundColor: '#ffffff' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px dashed #000000', paddingBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{companyName}</h2>
                <p style={{ margin: 0 }}>{tagLine}</p>
                <p style={{ margin: '0.5rem 0 0 0' }}>Data: {new Date(sale.date).toLocaleString('pt-BR')}</p>
                <p style={{ margin: 0 }}>Venda: #{sale.id.slice(0, 8)}</p>
                <p style={{ margin: 0 }}>Pagamento: {sale.paymentMethod === 'CASH' ? 'Dinheiro' : sale.paymentMethod === 'CARD' ? 'Multicaixa' : 'Outro'}</p>
                <p style={{ margin: 0 }}>Vendedor: {sale.sellerName}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                {sale.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>{item.quantity}x {item.name}</span>
                        <span>{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.price * item.quantity)}</span>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'right', borderTop: '1px dashed #000000', paddingTop: '0.5rem', fontWeight: 'bold', fontSize: '14px', marginBottom: '1rem' }}>
                TOTAL: {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(sale.total)}
            </div>

            <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '1rem' }}>
                <p style={{ margin: 0 }}>Obrigado pela preferência!</p>
                <p style={{ margin: 0 }}>*** Documento sem valor fiscal ***</p>
            </div>
        </div>
    );
});

Receipt.displayName = 'Receipt';
