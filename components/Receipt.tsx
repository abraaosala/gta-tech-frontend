import React from 'react';
import { Sale } from '../types';

interface ReceiptProps {
    sale: Sale | null;
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ sale }, ref) => {
    if (!sale) return null;

    return (
        <div ref={ref} className="p-4" style={{ width: '80mm', fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
            <div className="text-center mb-4 border-b border-dashed border-black pb-2">
                <h2 className="text-lg font-bold m-0">GTA - Tech</h2>
                <p className="m-0">Soluções em Tecnologia</p>
                <p className="m-0 mt-2">Data: {new Date(sale.date).toLocaleString('pt-BR')}</p>
                <p className="m-0">Venda: #{sale.id.slice(0, 8)}</p>
                <p className="m-0">Pagamento: {sale.paymentMethod === 'CASH' ? 'Dinheiro' : sale.paymentMethod === 'CARD' ? 'Multicaixa' : 'Outro'}</p>
                <p className="m-0">Vendedor: {sale.sellerName}</p>
            </div>

            <div className="mb-4">
                {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between mb-1">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.price * item.quantity)}</span>
                    </div>
                ))}
            </div>

            <div className="text-right border-top border-dashed border-black pt-2 font-bold text-sm mb-4">
                TOTAL: {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(sale.total)}
            </div>

            <div className="text-center text-xs mt-4">
                <p className="m-0">Obrigado pela preferência!</p>
                <p className="m-0">*** Documento sem valor fiscal ***</p>
            </div>
        </div>
    );
});

Receipt.displayName = 'Receipt';
