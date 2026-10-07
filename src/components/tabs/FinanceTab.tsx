import React, { useState, useMemo } from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Calendar,
  Filter,
  X,
  CreditCard,
  Percent,
} from 'lucide-react';
import { Transaction, TransactionType, UserAuth } from '../../types';
import { LockedBonusBanner } from '../LockedBonusBanner';
import { isBonusUnlocked } from '../../utils/storage';

interface Props {
  transactions: Transaction[];
  userAuth: UserAuth;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleBonusOverride: () => void;
}

export const FinanceTab: React.FC<Props> = ({
  transactions,
  userAuth,
  onAddTransaction,
  onDeleteTransaction,
  onToggleBonusOverride,
}) => {
  const isUnlocked = isBonusUnlocked(userAuth);

  const [filterPeriod, setFilterPeriod] = useState<'thisMonth' | 'lastMonth' | 'all'>('thisMonth');
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [type, setType] = useState<TransactionType>('entrada');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Atendimentos');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Cartão Crédito' | 'Cartão Débito' | 'Dinheiro' | 'Boleto' | 'Outro'>('Pix');

  // If locked, render the locked banner
  if (!isUnlocked) {
    return (
      <LockedBonusBanner
        moduleName="Módulo Bônus: Controle Financeiro"
        moduleDescription="Acompanhe entradas, despesas e seu lucro líquido em tempo real com relatórios simples e objetivos para o seu negócio."
        userAuth={userAuth}
        onUnlockOverrideToggle={onToggleBonusOverride}
      />
    );
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Type filter
        if (filterType !== 'all' && t.type !== filterType) {
          return false;
        }

        // Period filter
        if (filterPeriod !== 'all') {
          const tDate = new Date(t.date + 'T00:00:00');
          if (filterPeriod === 'thisMonth') {
            if (tDate.getMonth() !== currentMonth || tDate.getFullYear() !== currentYear) {
              return false;
            }
          } else if (filterPeriod === 'lastMonth') {
            const lastMonthTarget = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastYearTarget = currentMonth === 0 ? currentYear - 1 : currentYear;
            if (tDate.getMonth() !== lastMonthTarget || tDate.getFullYear() !== lastYearTarget) {
              return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterPeriod, currentMonth, currentYear]);

  // Financial metrics
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((t) => {
      if (t.type === 'entrada') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });

    const netProfit = income - expense;
    const margin = income > 0 ? (netProfit / income) * 100 : 0;

    return { income, expense, netProfit, margin };
  }, [filteredTransactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }
    if (!description.trim()) {
      alert('Informe a descrição do lançamento.');
      return;
    }

    onAddTransaction({
      type,
      amount: Number(amount),
      description: description.trim(),
      category: category.trim(),
      date,
      paymentMethod,
    });

    setIsModalOpen(false);
    setAmount('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CircleDollarSign className="w-6 h-6 text-blue-600" />
              Controle Financeiro Autônomo
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              BÔNUS LIBERADO
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Gestão simplificada de entradas de serviços e despesas com materiais e custos fixos.
          </p>
        </div>

        <button
          onClick={() => {
            setType('entrada');
            setCategory('Atendimentos');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Entradas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faturamento (Entradas)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {totals.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Recebimentos no período filtrado
          </p>
        </div>

        {/* Saídas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Despesas (Saídas)
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-red-600 tracking-tight">
              {totals.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Custos com materiais e despesas
          </p>
        </div>

        {/* Lucro Líquido */}
        <div className="bg-linear-to-br from-slate-900 to-blue-950 text-white rounded-2xl border border-blue-900 p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Lucro Líquido
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/40 text-cyan-300 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-black tracking-tight ${
                totals.netProfit >= 0 ? 'text-white' : 'text-red-400'
              }`}
            >
              {totals.netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <p className="text-[11px] text-blue-300 mt-1 flex items-center gap-1">
            <span>Margem líquida:</span>
            <strong className="text-white">{totals.margin.toFixed(1)}%</strong>
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Period Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterPeriod('thisMonth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterPeriod === 'thisMonth'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setFilterPeriod('lastMonth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterPeriod === 'lastMonth'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Mês Passado
          </button>
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterPeriod === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos os Lançamentos
          </button>
        </div>

        {/* Type Selector */}
        <div className="flex items-center gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('entrada')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterType === 'entrada'
                ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Entradas (+)
          </button>
          <button
            onClick={() => setFilterType('saida')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterType === 'saida'
                ? 'bg-red-100 text-red-800 font-bold border border-red-300'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Saídas (-)
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Extrato de Movimentações ({filteredTransactions.length})
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CircleDollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-700">Nenhum lançamento encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Adicione uma entrada ou despesa para iniciar o acompanhamento financeiro.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((t) => (
              <div
                key={t.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      t.type === 'entrada'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}
                  >
                    {t.type === 'entrada' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {t.description}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>
                        {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-600">{t.category}</span>
                      {t.paymentMethod && (
                        <>
                          <span>•</span>
                          <span>{t.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-base font-black tracking-tight ${
                      t.type === 'entrada' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {t.type === 'entrada' ? '+' : '-'}
                    {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>

                  <button
                    onClick={() => {
                      if (confirm('Deseja excluir este lançamento financeiro?')) {
                        onDeleteTransaction(t.id);
                      }
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Excluir lançamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                Novo Lançamento Financeiro
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setType('entrada');
                    setCategory('Atendimentos');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    type === 'entrada'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Entrada (Receita)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('saida');
                    setCategory('Materiais & Produtos');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    type === 'saida'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Saída (Despesa)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    type === 'entrada'
                      ? 'Ex: Alongamento em Gel - Maria Silva'
                      : 'Ex: Compra de luvas e álcool 70%'
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    {type === 'entrada' ? (
                      <>
                        <option value="Atendimentos">Atendimentos</option>
                        <option value="Venda de Produtos">Venda de Produtos</option>
                        <option value="Cursos / Treinamentos">Cursos / Treinamentos</option>
                        <option value="Outras Entradas">Outras Entradas</option>
                      </>
                    ) : (
                      <>
                        <option value="Materiais & Produtos">Materiais & Produtos</option>
                        <option value="Descartáveis">Descartáveis</option>
                        <option value="Aluguel & Espaço">Aluguel & Espaço</option>
                        <option value="Energia / Água / Internet">Energia / Água / Internet</option>
                        <option value="Equipamentos & Manutenção">Equipamentos & Manutenção</option>
                        <option value="Marketing & Anúncios">Marketing & Anúncios</option>
                        <option value="Outras Despesas">Outras Despesas</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartão Crédito">Cartão de Crédito</option>
                  <option value="Cartão Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-xs transition cursor-pointer ${
                    type === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
