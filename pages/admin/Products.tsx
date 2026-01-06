import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import { categoryService, Category } from '../../services/categoryService';
import { Product, Meta } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import Swal from 'sweetalert2';

// Simple Icons using SVG to avoid deps
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<Meta | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    loadProducts(1);
    loadCategories();
  }, []);

  const loadProducts = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await productService.getProducts(page, 10);
      setProducts(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Failed to load products", error);
      showToast("Falha ao carregar produtos.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Você não poderá reverter isso!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await productService.deleteProduct(id);
        showToast("Produto excluído com sucesso!", "success");
        loadProducts(meta?.page || 1);
      } catch (error) {
        showToast("Erro ao excluir produto.", "error");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct.name && editingProduct.price) {
      try {
        await productService.saveProduct(editingProduct as Product);
        setIsModalOpen(false);
        showToast("Produto salvo com sucesso!", "success");
        loadProducts(meta?.page || 1);
        setEditingProduct({});
      } catch (error) {
        showToast("Erro ao salvar produto.", "error");
        console.error(error);
      }
    }
  };

  const openModal = (product?: Product) => {
    setEditingProduct(product || { name: '', description: '', price: 0, stock: 0, category: '', imageUrl: '', imei: '' });
    setIsModalOpen(true);
  };

  const openViewModal = (product: Product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '(...)';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Produtos</h2>
        <Button onClick={() => openModal()}>Novo Produto</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando produtos...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {product.imageUrl && (
                            <img className="h-10 w-10 rounded-full mr-3 object-cover flex-shrink-0" src={product.imageUrl} alt="" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500" title={product.description}>
                              {truncateText(product.description, 30)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            onClick={() => openViewModal(product)}
                            className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="Detalhes"
                          >
                            <EyeIcon />
                          </button>
                          <button
                            onClick={() => openModal(product)}
                            className="text-gray-500 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                            title="Editar"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Excluir"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Nenhum produto cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {meta && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={() => loadProducts(meta.page - 1)}
                    disabled={meta.page <= 1}
                    variant="secondary"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => loadProducts(meta.page + 1)}
                    disabled={meta.page >= meta.last_page}
                    variant="secondary"
                  >
                    Próximo
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{(meta.page - 1) * meta.per_page + 1}</span> a <span className="font-medium">{Math.min(meta.page * meta.per_page, meta.total)}</span> de <span className="font-medium">{meta.total}</span> resultados
                    </p>
                  </div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => loadProducts(meta.page - 1)}
                      disabled={meta.page <= 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${meta.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft />
                    </button>
                    {/* Page Numbers - Simplified */}
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Página {meta.page} de {meta.last_page || 1}
                    </span>
                    <button
                      onClick={() => loadProducts(meta.page + 1)}
                      disabled={meta.page >= meta.last_page}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${meta.page >= meta.last_page ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight />
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 50 }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl h-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-gray-800">{editingProduct.id ? 'Editar Produto' : 'Novo Produto'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Nome do Produto"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                  placeholder="Ex: IPhone 14 Pro Max"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      className="bg-white text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      required
                    >
                      <option value="">Selecione...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Preço (Kz)"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Estoque"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                    required
                  />
                  <Input
                    label="IMEI (Opcional)"
                    value={editingProduct.imei || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imei: e.target.value })}
                    placeholder="Número de série / IMEI"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Detalhes do produto... (Use (...) quando muito longo na visualização)"
                  />
                </div>

                <Input
                  label="URL da Imagem"
                  value={editingProduct.imageUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Produto</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && viewingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 50 }}>
          <div className="bg-white rounded-xl overflow-hidden w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="relative h-48 bg-gray-100 flex items-center justify-center">
              {viewingProduct.imageUrl ? (
                <img src={viewingProduct.imageUrl} alt={viewingProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400">Sem Imagem</div>
              )}
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 rounded-full mb-1">
                    {viewingProduct.category}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">{viewingProduct.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(viewingProduct.price)}
                  </p>
                  <p className={`text-xs font-medium ${viewingProduct.stock > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                    {viewingProduct.stock > 0 ? `${viewingProduct.stock} em estoque` : 'Esgotado'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Descrição</h4>
                  <p className="mt-1 text-gray-700 whitespace-pre-line">{viewingProduct.description}</p>
                </div>

                {viewingProduct.imei && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">IMEI / Serial</h4>
                    <p className="font-mono text-sm text-gray-800 break-all">{viewingProduct.imei}</p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <Button onClick={() => setIsViewModalOpen(false)} className="w-full justify-center" variant="secondary">
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};