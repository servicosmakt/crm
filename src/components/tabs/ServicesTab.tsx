import React, { useState, useMemo } from 'react';
import {
  Tags,
  Plus,
  Search,
  Clock,
  CircleDollarSign,
  Edit2,
  Trash2,
  X,
  Calculator,
  Layers,
} from 'lucide-react';
import { ServiceItem, ServiceCategory } from '../../types';

interface Props {
  services: ServiceItem[];
  onAddService: (service: Omit<ServiceItem, 'id'>) => void;
  onUpdateService: (service: ServiceItem) => void;
  onDeleteService: (id: string) => void;
  onOpenPricingCalculator?: () => void;
}

const CATEGORIES: ServiceCategory[] = [
  'Consultoria & Atendimento',
  'Beleza & Estética',
  'Saúde, Terapias & Bem-Estar',
  'Aulas, Treinos & Cursos',
  'Fotografia & Eventos',
  'Reparos, Manutenção & Técnico',
  'Design & Produção',
  'Unhas / Nail Design',
  'Serviços Profissionais',
  'Geral / Outros',
];

export const ServicesTab: React.FC<Props> = ({
  services,
  onAddService,
  onUpdateService,
  onDeleteService,
  onOpenPricingCalculator,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Consultoria & Atendimento');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [price, setPrice] = useState<number>(150);
  const [description, setDescription] = useState('');

  const openNewModal = () => {
    setEditingService(null);
    setName('');
    setCategory('Consultoria & Atendimento');
    setDurationMinutes(60);
    setPrice(150);
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setName(service.name);
    setCategory(service.category);
    setDurationMinutes(service.durationMinutes);
    setPrice(service.price);
    setDescription(service.description || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do serviço.');
      return;
    }

    if (editingService) {
      onUpdateService({
        ...editingService,
        name: name.trim(),
        category,
        durationMinutes: Number(durationMinutes) || 30,
        price: Number(price) || 0,
        description: description.trim() || undefined,
      });
    } else {
      onAddService({
        name: name.trim(),
        category,
        durationMinutes: Number(durationMinutes) || 30,
        price: Number(price) || 0,
        description: description.trim() || undefined,
      });
    }

    closeModal();
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === 'all' || s.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Tags className="w-6 h-6 text-blue-600" />
            Serviços & Catálogo de Preços
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Configure seu cardápio de procedimentos com durações e valores padrões.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPricingCalculator && (
            <button
              onClick={onOpenPricingCalculator}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs md:text-sm transition cursor-pointer"
              title="Calcular preço ideal com custo e margem de lucro"
            >
              <Calculator className="w-4 h-4" />
              <span>Precificar com Inteligência</span>
            </button>
          )}

          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Serviço</span>
          </button>
        </div>
      </div>

      {/* Filter and Categories Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do serviço..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Todos ({services.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = services.filter((s) => s.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Tags className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Nenhum serviço encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Cadastre os procedimentos que você realiza para agilizar agendamentos e cobranças.
          </p>
          <button
            onClick={openNewModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Serviço</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {service.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Editar serviço"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o serviço "${service.name}"?`)) {
                          onDeleteService(service.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Excluir serviço"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">
                  {service.name}
                </h3>

                {service.description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {service.durationMinutes >= 60
                      ? `${Math.floor(service.durationMinutes / 60)}h${
                          service.durationMinutes % 60 ? ` ${service.durationMinutes % 60}m` : ''
                        }`
                      : `${service.durationMinutes} min`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-lg font-extrabold text-blue-700">
                    {service.price.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                {editingService ? 'Editar Serviço' : 'Novo Serviço no Catálogo'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nome do Procedimento / Serviço *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Alongamento em Gel com Esmaltação"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Duração Estimada
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora (60 min)</option>
                    <option value={75}>1h 15min</option>
                    <option value={90}>1h 30min</option>
                    <option value={120}>2 horas</option>
                    <option value={150}>2h 30min</option>
                    <option value={180}>3 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Preço Padrão (R$) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="120,00"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-semibold text-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição / Detalhes (opcional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Materiais inclusos, etapas do procedimento..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition cursor-pointer"
                >
                  {editingService ? 'Salvar Alterações' : 'Adicionar ao Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
