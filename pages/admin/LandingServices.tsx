import React, { useEffect, useState } from 'react';
import { landingService, LandingServiceData } from '../../services/landingService';
import { Button } from '../../components/ui/Button';

// SVG Icons (Native)
const EditIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
);

export const LandingServices = () => {
    const [services, setServices] = useState<LandingServiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<LandingServiceData | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await landingService.getServices();
            setServices(data);
        } catch (error) {
            console.error("Erro ao carregar serviços:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja excluir este serviço?")) return;
        try {
            await landingService.deleteService(id);
            setServices(services.filter(s => s.id !== id));
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            icon: formData.get('icon'),
            price: formData.get('price'),
            is_active: formData.get('is_active') === 'on'
        };

        try {
            if (isEditing) {
                await landingService.updateService(isEditing.id, data);
            } else {
                await landingService.storeService(data);
            }
            setShowModal(false);
            loadServices();
        } catch (error) {
            console.error("Erro ao salvar:", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando serviços do site...</div>;

    return (
        <div className="p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Serviços do Site</h2>
                    <p className="text-slate-500">Gerencie o que aparece na seção "Nossos Serviços" da Landing Page.</p>
                </div>
                <Button onClick={() => { setIsEditing(null); setShowModal(true); }} className="flex items-center">
                    <PlusIcon />
                    Novo Serviço
                </Button>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Serviço</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Ícone</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Preço (Exibição)</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{service.title}</div>
                                    <div className="text-xs text-slate-500 line-clamp-1">{service.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">
                                        {service.icon}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-medium">
                                    {service.price}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${service.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {service.is_active ? 'ATIVO' : 'INATIVO'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => { setIsEditing(service); setShowModal(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <EditIcon />
                                        </button>
                                        <button onClick={() => handleDelete(service.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Simple Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">
                            {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input name="title" defaultValue={isEditing?.title} required className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                                <textarea name="description" defaultValue={isEditing?.description} required className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ícone (Nome)</label>
                                    <input name="icon" defaultValue={isEditing?.icon} placeholder="Ex: smartphone, battery" required className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Preço (Texto)</label>
                                    <input name="price" defaultValue={isEditing?.price} placeholder="Ex: Kz 5.000" required className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 py-2">
                                <input type="checkbox" name="is_active" defaultChecked={isEditing ? isEditing.is_active : true} className="w-4 h-4 text-indigo-600" />
                                <label className="text-sm text-slate-700">Serviço Ativo</label>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancelar</Button>
                                <Button type="submit">Salvar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
