
import React, { useState, useCallback, useEffect } from 'react';
import GameView from './components/GameView';
import { GameState, HighScore } from './types';
import { ASSETS } from './constants';

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

  const startTutorial = () => {
    setGameState(GameState.TUTORIAL);
    setScore(0);
    setSpeed(3.0);
    setPlayerName('');
  };

  const confirmTutorial = () => {
    setGameState(GameState.PLAYING);
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
  const speedPercentage = Math.min(100, ((speed - 3) / 7) * 100);

  return (
    <div className="h-screen w-screen bg-white flex flex-col overflow-hidden font-['Inter']">
      
      {/* Header Branding - Full Width */}
      <div className="bg-white px-10 py-5 flex justify-between items-center border-b border-slate-100 z-30">
        <div className="flex items-center gap-8">
           <div className="flex flex-col">
              <span className="text-4xl font-black text-blue-600 tracking-tighter leading-none">MarQ</span>
              <span className="text-sm font-bold text-slate-400 self-end -mt-1 tracking-widest">HR</span>
           </div>
           <div className="h-10 w-[1.5px] bg-slate-200"></div>
           <div className="flex flex-col">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                Ajude a Márcia do RH economizar tempo
              </h1>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Melhor Desempenho</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{maxScore}<span className="text-sm text-slate-400 ml-1 italic font-normal">h</span></p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative flex-1 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <GameView 
            state={gameState} 
            onGameOver={handleGameOver} 
            onScoreUpdate={setScore}
            onSpeedUpdate={setSpeed}
          />
        </div>

        {/* Overlay: START */}
        {gameState === GameState.START && (
          <div className="absolute inset-0 bg-white/95 flex flex-col z-40 animate-in fade-in duration-500">
            <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
              <div className="px-16 py-8 flex flex-col justify-center bg-white border-r border-slate-100">
                <div className="max-w-md">
                  <p className="text-slate-900 text-3xl font-black leading-tight mb-8">
                    Nossa gestora está presa em processos manuais.
                  </p>
                  <p className="text-slate-500 text-xl leading-relaxed mb-10">
                    A cada obstáculo superado com a <span className="text-blue-600 font-extrabold">MarQ</span>, Márcia ganha tempo para o que realmente importa: <span className="text-slate-800 font-bold italic">as pessoas.</span>
                  </p>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">!</div>
                    <p className="text-sm text-blue-800 font-bold italic">Dica: Use o salto duplo para evitar pilhas de papel maiores!</p>
                  </div>
                </div>
              </div>

              <div className="px-16 py-8 bg-slate-50 flex flex-col justify-center">
                <h3 className="text-slate-400 text-sm font-black uppercase tracking-[0.2em] mb-8">Desvios de Burocracia</h3>
                <div className="grid grid-cols-1 gap-6 max-w-md">
                  {[
                    { img: ASSETS.REP, title: 'REP Tradicional', action: 'PULAR', desc: 'Não deixe o ponto manual te atrasar.', color: 'bg-blue-600' },
                    { img: ASSETS.PAPER, title: 'Burocracia Física', action: 'SALTAR', desc: 'Pilhas de papel sugam produtividade.', color: 'bg-blue-600' },
                    { img: ASSETS.SUSPENDED_FILES, title: 'Sobrecarga Digital', action: 'ABAIXAR', desc: 'Gmail lotado é obstáculo suspenso.', color: 'bg-red-500' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-transform hover:scale-[1.02]">
                      <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-slate-50 rounded-2xl p-2">
                        <img src={item.img} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{item.title}</p>
                          <span className={`text-[10px] font-black ${item.color} text-white px-4 py-1.5 rounded-full`}>{item.action}</span>
                        </div>
                        <p className="text-base text-slate-500 font-medium leading-tight">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 bg-white border-t border-slate-100 flex justify-center items-center gap-16">
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <kbd className="bg-slate-100 text-slate-900 px-3 py-2 rounded-xl text-sm font-black border-b-4 border-slate-200">↑</kbd>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pular</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="bg-slate-100 text-slate-900 px-3 py-2 rounded-xl text-sm font-black border-b-4 border-slate-200">↓</kbd>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abaixar</span>
                </div>
              </div>

              <button 
                onClick={startTutorial}
                className="group relative bg-blue-600 hover:bg-blue-700 text-white font-black py-6 px-20 rounded-[2rem] text-2xl shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)] transform transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span>COMEÇAR MISSÃO RH</span>
                <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </button>

              <div className="w-40 text-xs font-bold text-slate-400 text-right leading-tight">
                Preparada para digitalizar o RH hoje?
              </div>
            </div>
          </div>
        )}

        {/* Overlay: TUTORIAL (O Novo Pop-up de Instruções) */}
        {gameState === GameState.TUTORIAL && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-8 animate-in fade-in duration-300">
             <div className="bg-white p-12 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] max-w-2xl w-full text-slate-900 border border-slate-100 scale-in-center animate-in zoom-in-95">
                <div className="flex flex-col items-center">
                   <div className="w-20 h-2 bg-blue-600 rounded-full mb-10"></div>
                   <h2 className="text-4xl font-black mb-10 tracking-tighter text-center">COMO JOGAR</h2>
                   
                   <div className="grid grid-cols-2 gap-8 w-full mb-12">
                      <div className="flex flex-col items-center bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center">
                         <div className="flex gap-2 mb-6">
                            <kbd className="bg-white px-4 py-2 rounded-xl shadow-md border-b-4 border-slate-200 text-xl font-black">↑</kbd>
                            <span className="text-slate-300 self-center text-xl font-black">ou</span>
                            <kbd className="bg-white px-8 py-2 rounded-xl shadow-md border-b-4 border-slate-200 text-sm font-black italic">ESPAÇO</kbd>
                         </div>
                         <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Pulo / Salto Duplo</p>
                         <p className="text-xs text-slate-500 font-medium">Pressione 2x para saltar pilhas maiores.</p>
                      </div>

                      <div className="flex flex-col items-center bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center">
                         <div className="flex gap-2 mb-6">
                            <kbd className="bg-white px-4 py-2 rounded-xl shadow-md border-b-4 border-slate-200 text-xl font-black">↓</kbd>
                         </div>
                         <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Evasão / Abaixar</p>
                         <p className="text-xs text-slate-500 font-medium">Desvie de obstáculos aéreos (Gmail/Alertas).</p>
                      </div>
                   </div>

                   <button 
                      onClick={confirmTutorial}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl text-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95"
                   >
                      ENTENDIDO, VAMOS LÁ!
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Overlay: NAME ENTRY */}
        {gameState === GameState.NAME_ENTRY && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl flex flex-col items-center justify-center z-50 p-8 animate-in fade-in duration-500">
            <div className="bg-white p-16 rounded-[4rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] text-slate-900 w-full max-w-lg text-center border border-slate-100 scale-in-center animate-in zoom-in-90">
              <div className="w-24 h-2 bg-blue-600 mx-auto mb-10 rounded-full"></div>
              <h2 className="text-6xl font-black mb-2 tracking-tighter text-slate-900">RECORDE!</h2>
              <p className="text-xl font-bold text-slate-400 mb-12">Você poupou <span className="text-blue-600">{score} horas</span> de trabalho!</p>
              
              <div className="mb-12">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Assine sua performance</p>
                <input 
                  type="text" 
                  maxLength={3}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                  className="w-full text-center text-8xl font-black tracking-[0.2em] border-b-8 border-blue-600 focus:outline-none uppercase py-4 text-blue-600 placeholder:text-slate-100"
                  placeholder="AAA"
                  autoFocus
                />
              </div>

              <button 
                onClick={saveScore}
                disabled={playerName.length !== 3}
                className="w-full bg-blue-600 disabled:bg-slate-200 text-white font-black py-6 rounded-3xl text-2xl transition-all hover:bg-blue-700 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)]"
              >
                SALVAR NO HALL DA FAMA
              </button>
            </div>
          </div>
        )}

        {/* Overlay: RANKING / GAME OVER */}
        {(gameState === GameState.GAME_OVER || gameState === GameState.RANKING) && (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center z-40 p-12 text-white animate-in fade-in duration-500">
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#3b82f6,transparent_70%)]"></div>
            </div>

            <div className="relative flex gap-12 w-full max-w-6xl items-stretch">
              <div className="flex-1 flex flex-col justify-center items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-[3rem] p-16 text-center shadow-2xl">
                <div className="mb-12">
                  <span className="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-6">Resumo da Missão</span>
                  <p className="text-slate-400 text-xl font-bold mb-2">Tempo Recuperado</p>
                  <h2 className="text-[10rem] font-black tracking-tighter leading-none mb-4 text-white drop-shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
                    {score}<span className="text-4xl text-blue-500 ml-4 font-black italic">h</span>
                  </h2>
                  <p className="text-blue-200/60 text-lg font-medium italic">"RH Estratégico é RH com tempo."</p>
                </div>

                <div className="flex flex-col gap-5 w-full max-w-sm">
                  <button 
                    onClick={startTutorial}
                    className="group bg-blue-600 hover:bg-blue-500 text-white font-black py-6 px-10 rounded-2xl text-xl shadow-[0_20px_40px_-10px_rgba(37,99,235,0.6)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4"
                  >
                    <span>JOGAR NOVAMENTE</span>
                    <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  </button>
                  <button 
                    onClick={goToStart}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-10 rounded-2xl text-sm transition-all border border-white/10"
                  >
                    VOLTAR AO INÍCIO
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-950 rounded-[3rem] border border-white/5 p-16 flex flex-col shadow-2xl relative overflow-hidden">
                 <div className="flex items-center justify-between mb-12">
                   <div>
                     <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Hall da Eficiência</h3>
                     <p className="text-2xl font-black text-white">Top 5 Gestores</p>
                   </div>
                   <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                     <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.47 1.15 1.45 2.05 2.61 2.56V19H7v2h10v-2h-3v-2.5c1.16-.51 2.14-1.41 2.61-2.56C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zm-12 4V7h2v5.44C7.89 12.18 7 10.7 7 9zm10 3.44V7h2v2c0 1.7-.89 3.18-2 3.44z"/></svg>
                   </div>
                 </div>

                 <div className="space-y-4 flex-1">
                   {highScores.map((hs, idx) => (
                     <div key={idx} className={`flex justify-between items-center p-6 rounded-2xl border transition-all duration-500 animate-in slide-in-from-right delay-${idx * 100} ${idx === 0 ? 'bg-blue-600 text-white border-blue-400 shadow-[0_10px_30px_rgba(37,99,235,0.3)]' : 'bg-white/5 border-white/5'}`}>
                       <div className="flex items-center gap-6">
                         <span className={`text-[14px] font-black w-10 h-10 flex items-center justify-center rounded-xl ${idx === 0 ? 'bg-white text-blue-600' : 'bg-white/10 text-slate-500'}`}>{idx + 1}</span>
                         <span className="font-black text-3xl tracking-widest">{hs.name}</span>
                       </div>
                       <div className="text-right">
                         <span className={`font-black text-3xl ${idx === 0 ? 'text-white' : 'text-blue-500'}`}>{hs.score}</span>
                         <span className={`text-sm ml-1 font-bold ${idx === 0 ? 'text-white/60' : 'text-slate-600'}`}>h</span>
                       </div>
                     </div>
                   ))}
                 </div>

                 <div className="mt-10 pt-8 border-t border-white/5 text-center">
                   <a href="https://marqhr.com" target="_blank" className="text-slate-500 hover:text-blue-500 text-xs font-bold transition-colors tracking-widest uppercase">Saiba mais em marqhr.com</a>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      {gameState === GameState.PLAYING && (
        <div className="bg-slate-950 px-12 py-8 grid grid-cols-3 items-center text-white z-30 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-8">
            <div className="relative w-16 h-16">
               <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-900" />
                 <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" 
                         strokeDasharray="175.8" strokeDashoffset={175.8 - (speedPercentage * 175.8 / 100)} 
                         className="text-blue-500 transition-all duration-700 ease-out" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-xs font-black text-blue-400">{speed.toFixed(1)}</span>
               </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Engajamento Márcia</span>
              <div className="flex gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`h-2 w-5 rounded-full transition-all duration-500 ${speedPercentage > (i * 12.5) ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-slate-900'}`}></div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] whitespace-nowrap">Tempo Recuperado</div>
            <p className="text-7xl font-black text-white leading-none tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              {score}<span className="text-2xl text-blue-500 ml-2 italic">h</span>
            </p>
          </div>

          <div className="flex justify-end gap-10">
             <div className="flex flex-col items-end gap-2">
               <div className="flex gap-2">
                  <kbd className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-white font-black text-sm">↑</kbd>
                  <kbd className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-white font-black text-sm italic">SPA</kbd>
               </div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Salto / Salto Duplo</span>
             </div>
             <div className="flex flex-col items-end gap-2">
                <kbd className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-white font-black text-sm">↓</kbd>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Evasão</span>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .scale-in-center {
          animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
        @keyframes scale-in-center {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        body { background-color: #0f172a; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default App;
