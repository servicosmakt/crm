import React, { useState, useMemo } from 'react';
import {
  Calculator,
  CircleDollarSign,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Save,
  CheckCircle2,
  Info,
  HelpCircle,
} from 'lucide-react';
import { UserAuth, ServiceItem, ServiceCategory } from '../../types';
import { LockedBonusBanner } from '../LockedBonusBanner';
import { isBonusUnlocked } from '../../utils/storage';

interface Props {
  userAuth: UserAuth;
  onSaveService: (service: Omit<ServiceItem, 'id'>) => void;
  onToggleBonusOverride: () => void;
}

export const PricingCalculatorTab: React.FC<Props> = ({
  userAuth,
  onSaveService,
  onToggleBonusOverride,
}) => {
  const isUnlocked = isBonusUnlocked(userAuth);

  // Form Fields
  const [serviceName, setServiceName] = useState('Consultoria / Atendimento Especializado');
  const [category, setCategory] = useState<ServiceCategory>('Consultoria & Atendimento');
  const [materialCost, setMaterialCost] = useState<number>(25); // R$
  const [durationMinutes, setDurationMinutes] = useState<number>(90); // 1h 30m
  const [desiredHourlyRate, setDesiredHourlyRate] = useState<number>(45); // R$/hora
  const [fixedCostShare, setFixedCostShare] = useState<number>(10); // R$ (aluguel, luz)
  const [targetProfitPercent, setTargetProfitPercent] = useState<number>(30); // 30% lucro sobre custo
  const [cardFeePercent, setCardFeePercent] = useState<number>(4.5); // 4.5% taxa de cartão / imposto

  // Hourly Rate Helper Drawer / state
  const [showHourlyAssistant, setShowHourlyAssistant] = useState(false);
  const [targetMonthlySalary, setTargetMonthlySalary] = useState<number>(5000); // R$
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number>(6); // horas
  const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState<number>(22); // dias

  const [savedSuccess, setSavedSuccess] = useState(false);

  // If locked, render the locked banner
  if (!isUnlocked) {
    return (
      <LockedBonusBanner
        moduleName="Módulo Bônus: Calculadora de Preços Inteligente"
        moduleDescription="Descubra o preço exato para nunca mais pagar para trabalhar: calcule custo de material, hora técnica, custos fixos e margem de lucro real."
        userAuth={userAuth}
        onUnlockOverrideToggle={onToggleBonusOverride}
      />
    );
  }

  // Calculate hourly rate from assistant
  const calculatedHourlyRateFromSalary = useMemo(() => {
    const totalHoursMonth = workingHoursPerDay * workingDaysPerMonth;
    if (totalHoursMonth <= 0) return 0;
    return targetMonthlySalary / totalHoursMonth;
  }, [targetMonthlySalary, workingHoursPerDay, workingDaysPerMonth]);

  // Main Pricing Math
  const calculation = useMemo(() => {
    const hours = durationMinutes / 60;
    const laborCost = hours * desiredHourlyRate;
    const baseCost = Number(materialCost) + Number(fixedCostShare) + laborCost;

    // Price with target profit
    const priceBeforeCardFee = baseCost * (1 + targetProfitPercent / 100);

    // If cardFeePercent applies, we calculate price so after fee deduction we keep priceBeforeCardFee:
    // suggestedPrice * (1 - fee/100) = priceBeforeCardFee => suggestedPrice = priceBeforeCardFee / (1 - fee/100)
    const feeDecimal = cardFeePercent / 100;
    const suggestedPrice =
      feeDecimal < 1 ? priceBeforeCardFee / (1 - feeDecimal) : priceBeforeCardFee;

    const cardFeeAmount = suggestedPrice * feeDecimal;
    const netReceived = suggestedPrice - cardFeeAmount;
    const realNetProfit = netReceived - (Number(materialCost) + Number(fixedCostShare) + laborCost);

    return {
      hours,
      laborCost,
      baseCost,
      cardFeeAmount,
      suggestedPrice: Math.ceil(suggestedPrice), // Round up to clean real
      realNetProfit: Math.max(0, realNetProfit),
    };
  }, [
    materialCost,
    durationMinutes,
    desiredHourlyRate,
    fixedCostShare,
    targetProfitPercent,
    cardFeePercent,
  ]);

  const handleApplyCalculatedHourly = () => {
    setDesiredHourlyRate(Math.round(calculatedHourlyRateFromSalary));
    setShowHourlyAssistant(false);
  };

  const handleSaveToCatalog = () => {
    if (!serviceName.trim()) {
      alert('Informe o nome do serviço para salvar no catálogo.');
      return;
    }

    onSaveService({
      name: serviceName.trim(),
      category,
      durationMinutes,
      price: calculation.suggestedPrice,
      description: `Precificado via Calculadora Inteligente. Custo material: R$ ${materialCost}.`,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              Calculadora de Preços Inteligente
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              BÔNUS LIBERADO
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Precifique com precisão matemática: cubra custos de produtos, pague sua mão de obra e garanta lucro líquido real.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Dados do Procedimento
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome do Serviço
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                <option value="Consultoria & Atendimento">Consultoria & Atendimento</option>
                <option value="Beleza & Estética">Beleza & Estética</option>
                <option value="Saúde, Terapias & Bem-Estar">Saúde, Terapias & Bem-Estar</option>
                <option value="Aulas, Treinos & Cursos">Aulas, Treinos & Cursos</option>
                <option value="Fotografia & Eventos">Fotografia & Eventos</option>
                <option value="Reparos, Manutenção & Técnico">Reparos, Manutenção & Técnico</option>
                <option value="Design & Produção">Design & Produção</option>
                <option value="Unhas / Nail Design">Unhas / Nail Design</option>
                <option value="Geral / Outros">Geral / Outros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Custo de Material */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Custo de Material / Produtos (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(Number(e.target.value))}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gasto aproximado de produtos por cliente.
              </p>
            </div>

            {/* Duração */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tempo Gasto no Serviço
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                <option value={30}>30 minutos (0.5h)</option>
                <option value={45}>45 minutos (0.75h)</option>
                <option value={60}>1 hora (60 min)</option>
                <option value={75}>1h 15min</option>
                <option value={90}>1h 30min (1.5h)</option>
                <option value={120}>2 horas (120 min)</option>
                <option value={150}>2h 30min</option>
                <option value={180}>3 horas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Valor da Hora Técnica */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Sua Hora de Trabalho (R$/h)
                </label>
                <button
                  type="button"
                  onClick={() => setShowHourlyAssistant(!showHourlyAssistant)}
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                >
                  <HelpCircle className="w-3 h-3" />
                  Calcular hora
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={desiredHourlyRate}
                  onChange={(e) => setDesiredHourlyRate(Number(e.target.value))}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Custos Fixos Proporcionais */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Custos Fixos / Espaço (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={fixedCostShare}
                  onChange={(e) => setFixedCostShare(Number(e.target.value))}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Fração de luz, água, aluguel e café.
              </p>
            </div>
          </div>

          {/* Assistant Drawer for Hourly Rate */}
          {showHourlyAssistant && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <strong className="text-blue-900 font-bold flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Como descobrir o valor da sua hora ideal?
                </strong>
                <button
                  type="button"
                  onClick={() => setShowHourlyAssistant(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Meta de Salário Mensal (R$)</label>
                  <input
                    type="number"
                    value={targetMonthlySalary}
                    onChange={(e) => setTargetMonthlySalary(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Horas trabalhadas / dia</label>
                  <input
                    type="number"
                    value={workingHoursPerDay}
                    onChange={(e) => setWorkingHoursPerDay(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Dias trabalhados / mês</label>
                  <input
                    type="number"
                    value={workingDaysPerMonth}
                    onChange={(e) => setWorkingDaysPerMonth(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-blue-200/60">
                <span className="text-blue-900">
                  Sua hora ideal calculada:{' '}
                  <strong>
                    {calculatedHourlyRateFromSalary.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                    /hora
                  </strong>
                </span>

                <button
                  type="button"
                  onClick={handleApplyCalculatedHourly}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  Aplicar este valor
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Margem de Lucro */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Margem de Lucro Desejada (%)
                </label>
                <span className="text-xs font-bold text-blue-700">{targetProfitPercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={targetProfitPercent}
                onChange={(e) => setTargetProfitPercent(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Lucro extra para reinvestimento e crescimento.
              </p>
            </div>

            {/* Taxa de Cartão / Impostos */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Taxa de Cartão / Taxas (%)
                </label>
                <span className="text-xs font-bold text-slate-700">{cardFeePercent}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="25"
                step="0.5"
                value={cardFeePercent}
                onChange={(e) => setCardFeePercent(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Right Result Card: Ideal Suggested Price */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-linear-to-b from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 border border-blue-900/60 shadow-xl relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-blue-800/60">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Resultado da Precificação
              </span>
              <span className="text-xs text-slate-300">
                Tempo: {durationMinutes} min
              </span>
            </div>

            {/* Big Suggested Price Display */}
            <div className="my-6 text-center">
              <span className="text-xs font-medium text-slate-300 block mb-1">
                Preço de Venda Sugerido
              </span>
              <div className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {calculation.suggestedPrice.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
              <p className="text-xs text-emerald-400 font-semibold mt-2">
                ✓ Valor justo, seguro e altamente lucrativo
              </p>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Custo de Materiais:</span>
                <span className="font-semibold text-white">
                  {materialCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Mão de Obra ({durationMinutes}min):</span>
                <span className="font-semibold text-white">
                  {calculation.laborCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Custos Fixos / Estrutura:</span>
                <span className="font-semibold text-white">
                  {fixedCostShare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Taxa Cartão ({cardFeePercent}%):</span>
                <span className="font-semibold text-amber-300">
                  {calculation.cardFeeAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-emerald-400 font-bold">
                <span>Lucro Líquido Real (em R$):</span>
                <span className="text-sm">
                  + {calculation.realNetProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          {/* Action: Save to Services */}
          <div className="pt-6 mt-6 border-t border-blue-900/60">
            {savedSuccess ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Salvo com sucesso na aba Serviços & Preços!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSaveToCatalog}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs md:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar este Preço no Catálogo</span>
              </button>
            )}
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Você pode usar este preço instantaneamente em novos agendamentos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
