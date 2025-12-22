
import React, { useState, useCallback, useEffect } from 'react';
import GameView from './components/GameView';
import { GameState, HighScore } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(3.0);
  const [playerName, setPlayerName] = useState('');
  const [highScores, setHighScores] = useState<HighScore[]>(() => {
    const saved = localStorage.getItem('marq_high_scores');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('marq_high_scores', JSON.stringify(highScores));
  }, [highScores]);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setSpeed(3.0);
    setPlayerName('');
  };

  const goToStart = () => {
    setGameState(GameState.START);
  };

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    const isHighScore = highScores.length < 5 || finalScore > (highScores[highScores.length - 1]?.score || 0);
    
    if (isHighScore && finalScore > 0) {
      setGameState(GameState.NAME_ENTRY);
    } else {
      setGameState(GameState.GAME_OVER);
    }
  }, [highScores]);

  const saveScore = () => {
    if (playerName.length !== 3) return;
    const newScores = [...highScores, { name: playerName.toUpperCase(), score }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setHighScores(newScores);
    setGameState(GameState.RANKING);
  };

  const maxScore = highScores.length > 0 ? highScores[0].score : 0;

  // Normalização da velocidade para o velocímetro (3.0 a 10.0+)
  const speedPercentage = Math.min(100, ((speed - 3) / 7) * 100);

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-600 relative">
        {/* Header Branding */}
        <div className="bg-white p-5 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-3xl font-black text-blue-600 tracking-tighter leading-none">MarQ</span>
                <span className="text-sm font-bold text-slate-400 self-end -mt-1 tracking-widest">HR</span>
             </div>
             <div className="h-10 w-[2px] bg-slate-200"></div>
             <div className="flex flex-col">
                <h1 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                  TIME SAVER
                </h1>
                <span className="text-[10px] text-slate-400 font-bold italic">FOCO NO QUE IMPORTA</span>
             </div>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Hall da Fama</p>
              <p className="text-2xl font-black text-blue-600 leading-none">{maxScore}h</p>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative aspect-[2/1] bg-slate-900 overflow-hidden">
          <GameView 
            state={gameState === GameState.PLAYING ? GameState.PLAYING : GameState.START} 
            onGameOver={handleGameOver} 
            onScoreUpdate={setScore}
            onSpeedUpdate={setSpeed}
          />

          {/* Overlay: START */}
          {gameState === GameState.START && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-20 text-center p-8 animate-in fade-in duration-300">
              <div className="mb-8 space-y-4">
                <div className="inline-block bg-blue-100 text-blue-700 text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest mb-2">
                  Missão Eficiência
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
                  Ajude a Márcia a economizar<br/>tempo com a MarQ!
                </h2>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                  Nossa gestora de RH está sobrecarregada. Use a tecnologia MarQ para ajudá-la a saltar sobre a burocracia e focar no desenvolvimento humano!
                </p>
              </div>
              <button 
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-16 rounded-2xl text-2xl shadow-xl transform transition hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <span>AJUDAR A MÁRCIA</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          )}

          {/* Overlay: NAME ENTRY */}
          {gameState === GameState.NAME_ENTRY && (
            <div className="absolute inset-0 bg-blue-600/95 flex flex-col items-center justify-center z-30 text-center p-8 text-white animate-in zoom-in-95 duration-300">
              <h2 className="text-5xl font-black mb-2 tracking-tighter">NOVO RECORDE!</h2>
              <p className="text-xl font-bold opacity-80 mb-8 text-blue-100">Você economizou {score} horas!</p>
              <div className="bg-white p-8 rounded-3xl shadow-2xl text-slate-900 w-full max-w-sm">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Suas Iniciais</p>
                <input 
                  type="text" 
                  maxLength={3}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                  className="w-full text-center text-6xl font-black tracking-[0.2em] border-b-4 border-blue-600 focus:outline-none uppercase mb-8 py-2 text-blue-600"
                  autoFocus
                />
                <button 
                  onClick={saveScore}
                  disabled={playerName.length !== 3}
                  className="w-full bg-blue-600 disabled:bg-slate-300 text-white font-black py-4 rounded-xl text-lg transition-all hover:bg-blue-700"
                >
                  SALVAR
                </button>
              </div>
            </div>
          )}

          {/* Overlay: RANKING / GAME OVER */}
          {(gameState === GameState.GAME_OVER || gameState === GameState.RANKING) && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-20 text-center p-8 text-white animate-in fade-in duration-300">
              <div className="flex gap-8 w-full max-w-2xl">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">
                    Economia de <span className="text-blue-400">{score}h</span>!
                  </h2>
                  <div className="flex flex-col gap-4 w-full">
                    <button 
                      onClick={goToStart}
                      className="bg-blue-600 text-white hover:bg-blue-500 font-black py-4 px-8 rounded-2xl text-lg shadow-2xl transition-all"
                    >
                      VOLTAR AO INÍCIO
                    </button>
                    <a 
                      href="https://marqhr.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white/10 text-white hover:bg-white/20 font-black py-4 px-8 rounded-2xl text-lg transition-all border border-white/20"
                    >
                      SITE OFICIAL
                    </a>
                  </div>
                </div>

                <div className="w-[1px] bg-white/10 h-64 self-center"></div>

                <div className="flex-1 text-left">
                   <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">Hall da Eficiência</h3>
                   <div className="space-y-3">
                     {highScores.map((hs, idx) => (
                       <div key={idx} className={`flex justify-between items-center p-3 rounded-xl border ${idx === 0 ? 'bg-blue-600/20 border-blue-500/30' : 'bg-white/5 border-white/5'}`}>
                         <span className="font-black text-lg tracking-widest">{hs.name}</span>
                         <span className="font-black text-blue-400">{hs.score}h</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* REWORKED FOOTER: Stats & Controls */}
        <div className="bg-slate-950 p-4 grid grid-cols-3 items-center text-white border-t border-slate-800">
          
          {/* 1. VELOCIMETRO */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90">
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
                         strokeDasharray="175.9" strokeDashoffset={175.9 - (speedPercentage * 175.9 / 100)} 
                         className="text-blue-500 transition-all duration-300" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-xs font-black text-blue-500">{speed.toFixed(1)}</span>
                 <span className="text-[6px] font-black uppercase text-slate-500">SPEED</span>
               </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aceleração</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-2 w-4 rounded-sm ${speedPercentage > (i * 20) ? 'bg-blue-500 shadow-[0_0_5px_#3b82f6]' : 'bg-slate-800'}`}></div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. SCORE CENTRAL */}
          <div className="text-center">
            <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-1">HORAS ECONOMIZADAS</p>
            <p className="text-5xl font-black text-white leading-none tabular-nums drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              {score}<span className="text-xl text-blue-500 ml-1">h</span>
            </p>
          </div>

          {/* 3. INSTRUÇÕES / CONTROLES */}
          <div className="flex flex-col items-end gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Como Jogar</span>
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <span className="bg-slate-800 text-white px-2 py-1 rounded text-[10px] font-black border border-slate-700">↑</span>
                <span className="text-[9px] font-bold text-slate-500">PULO DUPLO</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="bg-slate-800 text-white px-2 py-1 rounded text-[10px] font-black border border-slate-700">↓</span>
                <span className="text-[9px] font-bold text-slate-500">ABAIXAR</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="bg-slate-800 text-white px-2 py-1 rounded text-[10px] font-black border border-slate-700">ESP</span>
                <span className="text-[9px] font-bold text-slate-500">PULAR</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      <div className="mt-8 text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] flex gap-8 items-center">
        <span>&copy; 2025 MARQ TECHNOLOGY</span>
        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
        <a href="https://marqhr.com" className="hover:text-blue-600 transition-colors">VISITAR MARQHR.COM</a>
      </div>
    </div>
  );
};

export default App;
