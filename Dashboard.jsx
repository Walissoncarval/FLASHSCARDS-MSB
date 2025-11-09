import React, { useState, useEffect, useCallback } from "react";
// Importações de Entidades (Assumindo que estão corretas)
import { Deck, Card } from "@/entities/all"; [cite_start]// [cite: 4, 5]
// Importações de Componentes de UI
import { Button } from "@/components/ui/button"; [cite_start]// [cite: 7]
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; [cite_start]// [cite: 9]
import { Link } from "react-router-dom"; [cite_start]// [cite: 11]
// Importações de Utilitários e Ícones
import { createPageUrl } from "@/utils"; [cite_start]// [cite: 13]
import { Brain, BookOpen, Target, TrendingUp, Calendar, Zap } from "lucide-react"; [cite_start]// [cite: 15]
import { motion } from "framer-motion"; [cite_start]// [cite: 17]
// Importações de Componentes da Dashboard
import StatsOverview from "../components/dashboard/StatsOverview"; [cite_start]// [cite: 20]
import RecentDecks from "../components/dashboard/RecentDecks"; [cite_start]// [cite: 22]
import StudyProgress from "../components/dashboard/StudyProgress"; [cite_start]// [cite: 23]


[cite_start]export default function Dashboard() { // [cite: 26]
    // Estados
    const [decks, setDecks] = useState([]); [cite_start]// [cite: 28]
    const [cards, setCards] = useState([]); [cite_start]// [cite: 30]
    const [loading, setLoading] = useState(true); [cite_start]// [cite: 32]

    // Efeito para carregar dados na montagem
    [cite_start]useEffect(() => { // [cite: 37]
        loadData(); [cite_start]// [cite: 38]
    }, [/* dependências vazias para rodar apenas uma vez */]); [cite_start]// [cite: 39]

    // Função de carregamento de dados (Refatorada de 'carregarDados' para 'loadData')
    [cite_start]const loadData = useCallback(async () => { // [cite: 42, 43]
        setLoading(true); // Garante que o loading comece antes do try

        [cite_start]try { // Corrigido de 'tentar' [cite: 45]
            [cite_start]const [deckData, cardData] = await Promise.all([ // [cite: 47, 48]
                [cite_start]Deck.list('-updated_date'), // [cite: 50]
                [cite_start]Card.list('-updated_date', 100) // [cite: 52, 53]
            ]); [cite_start]// [cite: 55]

            setDecks(deckData); [cite_start]// [cite: 57]
            setCards(cardData); [cite_start]// Corrigido de 'dadosCard' para 'cardData' [cite: 59]
        [cite_start]} catch (error) { // Corrigido de 'catch (erro)' [cite: 61]
            console.error("Erro ao carregar dados:", error); [cite_start]// Corrigido a string [cite: 63]
        [cite_start]} finally { // Corrigido de 'finally {' [cite: 65]
            setLoading(false); [cite_start]// [cite: 67]
        }
    }, []); // Não depende de nada externo ao escopo

    // Função para contar cartões devidos (cards_due)
    [cite_start]const getDueCardsCount = () => { // [cite: 74, 75]
        // Correção na lógica de data: usar split('T') para datas ISO 8601
        const today = new Date().toISOString().split('T')[0]; [cite_start]// [cite: 78]
        return cards.filter(card => card.next_review && card.next_review.split('T')[0] <= today).length; [cite_start]// Adicionado verificação de 'next_review' e correção de split [cite: 79]
    }; [cite_start]// [cite: 81]

    // Função para calcular sequência de estudo (study streak)
    [cite_start]const getStudyStreak = () => { // [cite: 84, 85]
        // Lógica de cálculo de dias corrigida: (data atual - data anterior)
        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        
        [cite_start]const recentReviews = cards.filter(card => { // [cite: 89]
            if (!card.last_reviewed) return false; [cite_start]// Corrigido para '!card.last_reviewed' [cite: 92]
            
            const reviewDate = new Date(card.last_reviewed); [cite_start]// [cite: 94]
            const todayDate = new Date(); // Definir a data atual fora do loop para precisão

            // Cálculo correto da diferença de dias (em milissegundos)
            const daysDiffMs = todayDate.getTime() - reviewDate.getTime(); 
            [cite_start]// Cálculo da diferença em dias (corrigido da sintaxe fragmentada) [cite: 96, 98, 100]
            const daysDiff = Math.floor(daysDiffMs / MS_PER_DAY); 

            return daysDiff <= 7; [cite_start]// [cite: 102]
        }); [cite_start]// [cite: 104]

        [cite_start]// Retorna o mínimo entre o número de revisões e o limite (7 dias) [cite: 106, 107]
        return Math.min(recentReviews.length, 7); 
    }; [cite_start]// [cite: 109]

    // --- Início da Renderização ---
    // A estrutura de JSX estava fragmentada e fora do return. Foi remontada corretamente.
    [cite_start]return ( // [cite: 117]
        <div className="max-w-7xl mx-auto space-y-8 p-6 md:p-8 min-h-screen"> 
            
            {/* 1. Cabeçalho de Boas-Vindas */}
            <motion.div
                [cite_start]initial={{ opacity: 0, y: 20 }} // [cite: 119]
                [cite_start]animate={{ opacity: 1, y: 0 }} // [cite: 121, 122]
                [cite_start]className="text-center space-y-4" // [cite: 124]
            >
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    [cite_start]Bem-vindo ao FlashMind {/* [cite: 130, 131] */}
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Transforme seu aprendizado com flashcards de forma inteligente e repetição espaçada. [cite_start]{/* [cite: 137] */}
                </p>
            </motion.div>

            {/* 2. Visão Geral das Estatísticas */}
            <StatsOverview 
                [cite_start]totalDecks={decks.length} // [cite: 146]
                [cite_start]totalCards={cards.length} // [cite: 148]
                [cite_start]dueCards={getDueCardsCount()} // [cite: 150]
                [cite_start]studyStreak={getStudyStreak()} // [cite: 157]
                [cite_start]loading={loading} // [cite: 158]
            />

            {/* 3. Layout Principal (2 Colunas) */}
            [cite_start]<div className="grid lg:grid-cols-3 gap-8"> {/* [cite: 159] */}
                
                {/* Coluna Esquerda (2/3 da tela) */}
                [cite_start]<div className="lg:col-span-2 space-y-8"> {/* [cite: 161] */}
                    
                    {/* Componente: Decks Recentes */}
                    [cite_start]<RecentDecks decks={decks} loading={loading} /> {/* [cite: 167] */}

                    {/* Cartão: Sessão Rápida (Estudar Agora) */}
                    <motion.div
                        [cite_start]initial={{ opacity: 0, y: 30 }} // [cite: 168]
                        [cite_start]animate={{ opacity: 1, y: 0 }} // [cite: 170, 171]
                        [cite_start]transition={{ delay: 0.4 }} // [cite: 173, 174]
                    >
                        [cite_start]<UICard className="glass-effect border-0 shadow-2xl"> {/* [cite: 178] */}
                            [cite_start]<CardHeader className="pb-4"> {/* [cite: 180] */}
                                [cite_start]<div className="flex items-center gap-3"> {/* [cite: 182] */}
                                    [cite_start]<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"> {/* [cite: 184] */}
                                        [cite_start]<Zap className="w-5 h-5 text-white" /> {/* [cite: 199] */}
                                    </div>
                                    [cite_start]<CardTitle className="text-xl font-bold text-slate-800">Sessão Rápida</CardTitle> {/* [cite: 200] */}
                                </div>
                            </CardHeader>
                            [cite_start]<CardContent className="space-y-4"> {/* [cite: 201] */}
                                [cite_start]<p className="text-slate-600"> {/* [cite: 196] */}
                                    [cite_start]Você tem <span className="font-bold text-purple-600">{getDueCardsCount()}</span> cartões {/* [cite: 202] */}
                                    para revisar hoje. Continue seu progresso! [cite_start]{/* [cite: 203] */}
                                </p>
                                [cite_start]<Link to={createPageUrl("Estudo")}> {/* [cite: 207] */}
                                    [cite_start]<Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"> {/* [cite: 209, 210] */}
                                        [cite_start]<Brain className="w-5 h-5 mr-2" /> {/* [cite: 225] */}
                                        [cite_start]Começar a estudar {/* [cite: 226] */}
                                    </Button>
                                </Link>
                            </CardContent>
                        </UICard>
                    </motion.div>
                </div>
                
                {/* Coluna Direita (1/3 da tela) */}
                [cite_start]<div className="space-y-8"> {/* [cite: 232] */}
                    
                    {/* Componente: Progresso do Estudo */}
                    [cite_start]<StudyProgress cards={cards} loading={loading} /> {/* [cite: 233] */}

                    {/* Cartão: Dicas de Estudo */}
                    <motion.div
                        [cite_start]initial={{ opacity: 0, x: 30 }} // [cite: 236, 237]
                        [cite_start]animate={{ opacity: 1, x: 0 }} // [cite: 239, 240]
                        [cite_start]transition={{ delay: 0.5 }} // [cite: 242, 243]
                    >
                        [cite_start]<UICard className="glass-effect border-0 shadow-2xl"> {/* [cite: 256] */}
                            [cite_start]<CardHeader> {/* [cite: 257] */}
                                [cite_start]<CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-800"> {/* [cite: 258] */}
                                    [cite_start]<Target className="w-5 h-5 text-green-600" /> {/* [cite: 259] */}
                                    [cite_start]Dicas de Estudo {/* Corrigido de "te" [cite: 260] */}
                                </CardTitle>
                            </CardHeader>
                            [cite_start]<CardContent className="space-y-4"> {/* [cite: 263] */}
                                [cite_start]<div className="space-y-3"> {/* [cite: 264] */}
                                    
                                    {/* Dica 1 */}
                                    [cite_start]<div className="p-3 bg-green-50 rounded-lg border border-green-100"> {/* [cite: 265] */}
                                        [cite_start]<p className="text-sm font-medium text-green-800">Estude regularmente</p> {/* [cite: 266] */}
                                        [cite_start]<p className="text-xs text-green-600">15-30 minutos por dia é mais eficaz que uma sessão mais longa</p> {/* [cite: 266] */}
                                    </div>
                                    
                                    {/* Dica 2 */}
                                    [cite_start]<div className="p-3 bg-blue-50 rounded-lg border border-blue-100"> {/* [cite: 266] */}
                                        [cite_start]<p className="text-sm font-medium text-blue-800">Use a repetição espaçada</p> {/* [cite: 266] */}
                                        [cite_start]<p className="text-xs text-blue-600">Revisar cartões nos intervalos sugeridos</p> {/* [cite: 266] */}
                                    </div>
                                    
                                    {/* Dica 3 */}
                                    [cite_start]<div className="p-3 bg-orange-50 rounded-lg border border-orange-100"> {/* [cite: 266] */}
                                        [cite_start]<p className="text-sm font-medium text-orange-800">Seja honesto na avaliação</p> {/* [cite: 266] */}
                                        [cite_start]<p className="text-xs text-orange-600">Avalie sua dificuldade com precisão</p> {/* [cite: 266] */}
                                    </div>
                                </div>
                            </CardContent>
                        </UICard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}