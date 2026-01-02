import React, { useEffect, useState } from 'react';
import { landingService, LandingSetting } from '../../services/landingService';
import { Button } from '../../components/ui/Button';

export const LandingSettings = () => {
    const [settings, setSettings] = useState<LandingSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await landingService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key: string, value: string) => {
        setUpdating(key);
        try {
            await landingService.updateSetting(key, value);
            alert("Configuração atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            alert("Erro ao atualizar configuração.");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <div className="p-8">Carregando configurações...</div>;

    return (
        <div className="p-4 md:p-8">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Configurações do Site</h2>
                <p className="text-slate-500">Gerencie links de redes sociais e informações da Landing Page.</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Campo</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Valor (Link/Texto)</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {settings.map((setting) => (
                            <tr key={setting.key}>
                                <td className="px-6 py-4">
                                    <span className="font-medium text-slate-800">{setting.label}</span>
                                    <p className="text-xs text-slate-400 font-mono">{setting.key}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        defaultValue={setting.value}
                                        onBlur={(e) => handleUpdate(setting.key, e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <Button
                                        variant="secondary"
                                        disabled={updating === setting.key}
                                        size="sm"
                                    >
                                        {updating === setting.key ? 'Salvando...' : 'Salvo (Auto)'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
