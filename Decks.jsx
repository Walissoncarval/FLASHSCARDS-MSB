import React, { useState, useEffect, useCallback, useMemo } from "react";
// Assumindo que Deck e Card são classes/funções que interagem com o backend/armazenamento
import { Deck, Card } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Upload, Download } from "lucide-react"; // Removi FileText pois não foi usado
import { motion, AnimatePresence } from "framer-motion";

// Assumindo que esses componentes existem no seu projeto
import DeckCard from "../components/decks/DeckCard";
import CreateDeckModal from "../components/decks/CreateDeckModal";
import ImportModal from "../components/decks/ImportModal";
import ExportModal from "../components/decks/ExportModal";

// Adicionei um componente básico de Feedback para quando estiver carregando
const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
    <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
    <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
  </div>
);

export default function Decks() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados de controle dos modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Função para carregar os baralhos e suas estatísticas
  const loadDecks = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // 1. Carrega todos os baralhos, ordenados pela data de atualização
      const deckData = await Deck.list('-updated_date');

      // 2. Processa as estatísticas para cada baralho
      const decksWithStats = await Promise.all(
        deckData.map(async (deck) => {
          // Busca todos os cards associados ao deck
          const deckCards = await Card.filter({ deck_id: deck.id });
          
          // Data de hoje (para verificar cards pendentes de revisão)
          // Correção: Garantir que a comparação de data seja estrita ou apenas o dia
          const today = new Date().toISOString().split('T')[0];
          
          // Cards devidos (next_review é menor ou igual à data atual)
          const dueCards = deckCards.filter(card => 
            card.next_review && card.next_review.split('T')[0] <= today
          );

          return {
            ...deck,
            total_cards: deckCards.length,
            cards_due: dueCards.length,
          };
        })
      );

      setDecks(decksWithStats);
    } catch (error) {
      console.error("Erro ao carregar baralhos:", error);
      // Aqui você poderia adicionar um estado de erro para feedback ao usuário
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []); // Dependências vazias, pois a função não depende de props ou estados

  // Efeito para carregar os baralhos na montagem do componente
  useEffect(() => {
    loadDecks();
  }, [loadDecks]); // Adicionando loadDecks como dependência (Hook useCallback acima garante que ele é estável)

  // Handlers simples para modais
  const handleDeckCreated = () => {
    setShowCreateModal(false);
    loadDecks(false); // Recarrega os dados sem mostrar o spinner principal
  };
  
  const handleImportSuccess = () => {
    setShowImportModal(false);
    loadDecks(false); // Recarrega após importação
  };
  
  const handleExportSuccess = () => {
    setShowExportModal(false);
  };
  
  // Lógica de filtro/busca usando useMemo para otimizar
  const filteredDecks = useMemo(() => {
    if (!searchTerm) {
      return decks;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return decks.filter(deck => 
      deck.name.toLowerCase().includes(lowerCaseSearch) ||
      deck.description.toLowerCase().includes(lowerCaseSearch)
    );
  }, [decks, searchTerm]);


  // --- Renderização do Componente ---
  return (
    <div className="min-h-screen p-6 md:p-8 bg-gray-50">
      
      {/* 1. Cabeçalho e Ações */}
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Meus Baralhos</h1>
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          
          {/* Barra de Busca */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar baralhos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-2">
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo
            </Button>
            <Button onClick={() => setShowImportModal(true)} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button onClick={() => setShowExportModal(true)} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
          
        </div>
      </header>

      {/* 2. Listagem de Decks */}
      <main>
        {loading ? (
          <LoadingSkeleton />
        ) : filteredDecks.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            {searchTerm ? "Nenhum baralho encontrado com o termo de busca." : "Você ainda não tem baralhos. Crie um novo para começar!"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredDecks.map((deck) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DeckCard deck={deck} onLoadDecks={loadDecks} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* 3. Componentes Modais */}
      {showCreateModal && (
        <CreateDeckModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleDeckCreated}
        />
      )}
      
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}
      
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          // Supondo que o ExportModal precisa da lista completa de IDs/decks para exportar
          deckIds={decks.map(d => d.id)} 
          onSuccess={handleExportSuccess}
        />
      )}
      
    </div>
  );
}