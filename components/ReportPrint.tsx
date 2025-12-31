import React from 'react';

interface ReportPrintProps {
    title: string;
    summary: { label: string; value: string | number }[];
    headers: string[];
    data: React.ReactNode[][];
}

export const ReportPrint = React.forwardRef<HTMLDivElement, ReportPrintProps>(({ title, summary, headers, data }, ref) => {
    return (
        <div ref={ref} className="p-8 font-sans text-gray-900 bg-white" style={{ minWidth: '210mm', minHeight: '297mm' }}>
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">GTA - Tech</h1>
                <div className="flex justify-between items-end mt-2">
                    <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
                    <p className="text-sm text-gray-500">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
                </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 border-b border-gray-200 pb-2">Resumo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {summary.map((item, index) => (
                        <div key={index}>
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="text-lg font-bold text-gray-800">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Table */}
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-gray-300">
                        {headers.map((header, index) => (
                            <th key={index} className="py-2 px-2 font-bold text-sm text-gray-600 uppercase bg-gray-50">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="py-2 px-2 text-sm text-gray-700">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={headers.length} className="py-8 text-center text-gray-500 italic">
                                Nenhum dado encontrado para os filtros selecionados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Footer */}
            <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
                <p>GTA - Tech &bull; Soluções em Tecnologia &bull; Documento Interno</p>
            </div>
        </div>
    );
});

ReportPrint.displayName = 'ReportPrint';
