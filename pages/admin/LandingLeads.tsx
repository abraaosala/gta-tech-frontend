import React, { useEffect, useState } from 'react';
import { landingService, LandingContact } from '../../services/landingService';
import { Button } from '../../components/ui/Button';
import Swal from 'sweetalert2';

// SVG Icons to avoid lucide-react dependency issues
const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const MailIcon = () => (
    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const PhoneIcon = () => (
    <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export const LandingLeads = () => {
    const [leads, setLeads] = useState<LandingContact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            const data = await landingService.getContacts();
            setLeads(data);
        } catch (error) {
            console.error("Erro ao carregar leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: "Esta mensagem será removida permanentemente!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await landingService.deleteContact(id);
                setLeads(leads.filter(lead => lead.id !== id));
                Swal.fire({
                    title: 'Excluído!',
                    text: 'A mensagem foi removida.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Erro ao excluir mensagem:', error);
                Swal.fire('Erro!', 'Não foi possível remover a mensagem.', 'error');
            }
        }
    };

    if (loading) return <div className="p-8">Carregando mensagens...</div>;

    return (
        <div className="p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Mensagens Recebidas</h2>
                    <p className="text-slate-500">Contatos e pedidos de orçamento vindos do site.</p>
                </div>
                <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-bold text-sm">
                    {leads.length} Mensagens
                </div>
            </header>

            <div className="grid gap-6">
                {leads.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <svg className="mx-auto text-slate-300 mb-4 w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-slate-500">Nenhuma mensagem recebida ainda.</p>
                    </div>
                ) : (
                    leads.map((lead) => (
                        <div key={lead.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{lead.name}</h3>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <span className="flex items-center text-sm text-slate-500">
                                            <MailIcon />
                                            {lead.email}
                                        </span>
                                        {lead.phone && (
                                            <span className="flex items-center text-sm text-slate-500">
                                                <PhoneIcon />
                                                {lead.phone}
                                            </span>
                                        )}
                                        <span className="flex items-center text-sm text-slate-500">
                                            <CalendarIcon />
                                            {new Date(lead.created_at).toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(lead.id)}>
                                    <TrashIcon />
                                </Button>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 text-slate-700 whitespace-pre-wrap italic border border-slate-100">
                                "{lead.message}"
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
