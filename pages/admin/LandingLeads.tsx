import React, { useEffect, useState } from 'react';
import { landingService, LandingContact } from '../../services/landingService';
import { Button } from '../../components/ui/Button';
import { Trash2, Mail, Phone, Calendar } from 'lucide-react';

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
        if (!confirm("Tem certeza que deseja excluir esta mensagem?")) return;
        try {
            await landingService.deleteContact(id);
            setLeads(leads.filter(l => l.id !== id));
        } catch (error) {
            console.error("Erro ao excluir:", error);
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
                        <Mail className="mx-auto text-slate-300 mb-4" size={48} />
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
                                            <Mail size={16} className="mr-1 text-indigo-500" />
                                            {lead.email}
                                        </span>
                                        {lead.phone && (
                                            <span className="flex items-center text-sm text-slate-500">
                                                <Phone size={16} className="mr-1 text-emerald-500" />
                                                {lead.phone}
                                            </span>
                                        )}
                                        <span className="flex items-center text-sm text-slate-500">
                                            <Calendar size={16} className="mr-1 text-slate-400" />
                                            {new Date(lead.created_at).toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(lead.id)}>
                                    <Trash2 size={18} />
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
