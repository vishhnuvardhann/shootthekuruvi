import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- GAME DATA ---
interface Enemy {
  name: string;
  sprite: string;
  threat: boolean;
  desc: string;
}

const ALL_ENEMIES: Enemy[] = [
  { name: "Goomba", sprite: "🍄", threat: true, desc: "Dangerous! Walking mushroom.\nShoot before it reaches you!" },
  { name: "Koopa", sprite: "🐢", threat: true, desc: "Dangerous! Turtle shell charge.\nTake it out fast!" },
  { name: "Boo", sprite: "👻", threat: false, desc: "Harmless... only moves when\nyou look away. Save your bullet!" },
  { name: "Star", sprite: "⭐", threat: false, desc: "Harmless! A power-up star.\nDon't shoot it!" },
  { name: "Piranha Plant", sprite: "🌿", threat: true, desc: "Dangerous! Chomps everything.\nBlast it now!" },
  { name: "Lakitu", sprite: "☁️", threat: true, desc: "Dangerous! Throws Spinies.\nShoot before it rains!" },
  { name: "Toad", sprite: "🧢", threat: false, desc: "Harmless! Your ally Toad.\nDon't shoot your friend!" },
  { name: "Yoshi", sprite: "🦎", threat: false, desc: "Harmless! Yoshi's on your side.\nSkip safely." },
  { name: "Bullet Bill", sprite: "💣", threat: true, desc: "Dangerous! Homing missile.\nShoot it down NOW!" },
  { name: "Chain Chomp", sprite: "⛓️", threat: true, desc: "Dangerous! About to break free.\nOne shot, one kill!" },
];

const shuffle = (array: any[]) => array.slice().sort(() => Math.random() - 0.5);

type GameState = 'START' | 'PLAYING' | 'RESULT' | 'END';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [deck, setDeck] = useState<Enemy[]>([]);
  const [wave, setWave] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [history, setHistory] = useState<boolean[]>([]);
  const [actionFeedback, setActionFeedback] = useState<{message: string, isPositive: boolean, points: number} | null>(null);

  // Starts or Restarts the game
  const startGame = () => {
    setDeck(shuffle(ALL_ENEMIES).slice(0, 5));
    setWave(0);
    setScore(0);
    setLives(3);
    setHistory([]);
    setActionFeedback(null);
    setGameState('PLAYING');
  };

  const handleAction = (action: 'shoot' | 'skip') => {
    const enemy = deck[wave];
    let isPositive = false;
    let pointDelta = 0;
    let message = "";
    
    if (action === 'shoot') {
      if (enemy.threat) {
        isPositive = true;
        pointDelta = 10;
        message = `✅ NICE SHOT!\n${enemy.name} defeated!`;
      } else {
        isPositive = false;
        message = `❌ WRONG CALL!\nYou shot ${enemy.name}! -1 Life`;
        setLives(l => l - 1);
      }
    } else {
      if (!enemy.threat) {
        isPositive = true;
        pointDelta = 5;
        message = `👍 GOOD CALL!\n${enemy.name} is harmless!`;
      } else {
        isPositive = false;
        message = `❌ GOT HIT!\n${enemy.name} attacked! -1 Life`;
        setLives(l => l - 1);
      }
    }

    if (isPositive) setScore(s => s + pointDelta);
    setHistory(h => [...h, isPositive]);
    setActionFeedback({ message, isPositive, points: pointDelta });
    setGameState('RESULT');
  };

  const nextWave = () => {
    if (lives <= 0 || wave >= 4) {
      setGameState('END');
    } else {
      setWave(w => w + 1);
      setActionFeedback(null);
      setGameState('PLAYING');
    }
  };

  const currentEnemy = deck[wave];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-retro text-white md:bg-slate-900 bg-slate-950">
      
      {/* GAME BOY STYLE CONTAINER */}
      <div className="w-full max-w-2xl bg-sky-300 relative border-8 border-slate-100 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* PARALLAX CLOUDS BG */}
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none opacity-80">
          <motion.div animate={{ x: [-20, 20] }} transition={{ repeat: Infinity, duration: 10, repeatType: "reverse" }} className="absolute bg-white rounded-full h-8 w-24 top-6 left-12" />
          <motion.div animate={{ x: [20, -20] }} transition={{ repeat: Infinity, duration: 15, repeatType: "reverse" }} className="absolute bg-white rounded-full h-6 w-16 top-10 right-24" />
          <motion.div animate={{ x: [-10, 10] }} transition={{ repeat: Infinity, duration: 12, repeatType: "reverse" }} className="absolute bg-white rounded-full h-10 w-32 top-4 right-48" />
        </div>

        {/* GROUND */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-green-500 border-t-8 border-green-400 z-0"></div>

        {/* SCREEN CONTENT */}
        <div className="relative z-10 p-4 md:p-6 min-h-[500px] flex flex-col">
          
          {/* HEADER HUD */}
          {gameState !== 'START' && (
            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-lg border-2 border-sky-300 mb-6 text-[10px] md:text-xs">
              <div className="text-center">
                <div className="text-sky-300 mb-1">SCORE</div>
                <div>{score.toString().padStart(3, '0')}</div>
              </div>
              <div className="text-center hidden sm:block">
                <div className="text-sky-300 mb-1">BULLET</div>
                <div>{gameState === 'PLAYING' ? '🔵' : <span className="opacity-30">🔵</span>}</div>
              </div>
              <div className="text-center">
                <div className="text-sky-300 mb-1">WAVE</div>
                <div>{Math.min(wave + 1, 5)}/5</div>
              </div>
              <div className="text-center">
                <div className="text-sky-300 mb-1">LIVES</div>
                <div className="tracking-widest">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={i < lives ? "text-red-500" : "text-slate-600"}>❤</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PIPS (WAVE PROGRESS) */}
          {(gameState === 'PLAYING' || gameState === 'RESULT') && (
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: 5 }).map((_, i) => {
                let bgColor = "bg-white/30 border-white/50";
                if (i < wave || (i === wave && gameState === 'RESULT')) {
                  bgColor = history[i] ? "bg-green-500 border-green-600" : "bg-red-500 border-red-600";
                } else if (i === wave) {
                  bgColor = "bg-yellow-400 border-yellow-500 shadow-[0_0_10px_#facc15]";
                }
                return <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 ${bgColor} transition-colors duration-300`} />;
              })}
            </div>
          )}

          {/* MAIN STAGE */}
          <div className="flex-grow flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {gameState === 'START' && (
                <motion.div 
                  key="start"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center bg-slate-900/80 p-6 md:p-8 rounded-xl border-4 border-sky-400 max-w-sm mx-auto shadow-xl"
                >
                  <motion.div 
                    animate={{ y: [-5, 5] }}
                    transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    className="text-4xl md:text-5xl text-sky-400 mb-4"
                  >
                    ONE<br/>BULLET
                  </motion.div>
                  <p className="text-[10px] md:text-xs leading-relaxed text-sky-100 mb-8 max-w-xs mx-auto">
                    You have one bullet per wave.
                    <br/><br/>
                    Enemies appear one by one.
                    Some are dangerous, some are harmless.
                    <br/><br/>
                    Shoot threats. Skip allies.
                    Every wrong call costs a life.
                  </p>
                  <button 
                    onClick={startGame}
                    className="w-full bg-green-500 hover:bg-green-400 text-slate-900 text-sm py-4 border-4 border-white retro-border retro-border-active transition-all"
                  >
                    ▶ START GAME
                  </button>
                </motion.div>
              )}

              {gameState === 'PLAYING' && currentEnemy && (
                <motion.div 
                  key="playing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-full max-w-sm flex flex-col items-center pb-4"
                >
                  <div className="bg-white/20 backdrop-blur-sm border-4 border-white p-6 rounded-xl w-full text-center shadow-lg relative min-h-[220px] flex flex-col justify-center items-center">
                    <motion.div 
                      key={wave}
                      animate={{ y: [-8, 8] }}
                      transition={{ y: { repeat: Infinity, duration: 1.5, repeatType: "reverse", ease: "easeInOut" } }}
                      className="text-7xl md:text-8xl mb-4 drop-shadow-xl"
                    >
                      {currentEnemy.sprite}
                    </motion.div>
                    <h2 className="text-slate-900 text-sm md:text-base font-bold mb-3">{currentEnemy.name}</h2>
                    <p className="text-[9px] md:text-[10px] text-slate-800 leading-relaxed whitespace-pre-line border-t-2 border-slate-900/10 pt-3">
                      {currentEnemy.desc}
                    </p>
                  </div>

                  <div className="flex gap-4 mt-8 w-full">
                    <button 
                      onClick={() => handleAction('shoot')}
                      className="flex-1 bg-red-500 hover:bg-red-400 text-white text-xs py-4 border-4 border-white retro-border retro-border-active"
                    >
                      🔫 SHOOT
                    </button>
                    <button 
                      onClick={() => handleAction('skip')}
                      className="flex-1 bg-sky-500 hover:bg-sky-400 text-white text-xs py-4 border-4 border-white retro-border retro-border-active"
                    >
                      ⏭ SKIP
                    </button>
                  </div>
                </motion.div>
              )}

              {gameState === 'RESULT' && currentEnemy && actionFeedback && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-sm flex flex-col items-center"
                >
                  {/* Keep the enemy visible but blurred/faded behind result */}
                  <div className="bg-white/10 backdrop-blur-md border-4 border-white p-6 rounded-xl w-full text-center shadow-lg relative min-h-[220px] flex flex-col justify-center items-center">
                    
                    <motion.div
                      initial={{ x: 0 }}
                      animate={!actionFeedback.isPositive ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className="text-7xl md:text-8xl mb-4 drop-shadow-xl opacity-50 grayscale"
                    >
                      {currentEnemy.sprite}
                    </motion.div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <div className={`p-4 border-4 w-full text-center text-[10px] md:text-xs leading-loose bg-slate-900 shadow-2xl ${
                        actionFeedback.isPositive 
                          ? 'border-green-500 text-green-400' 
                          : 'border-red-500 text-red-400'
                      }`}>
                        <span className="text-white whitespace-pre-line leading-relaxed block mb-2">{actionFeedback.message}</span>
                        {actionFeedback.isPositive && <span className="text-yellow-400">+{actionFeedback.points} PTS</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 w-full">
                    <button 
                      onClick={nextWave}
                      className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-xs py-4 border-4 border-white retro-border retro-border-active"
                    >
                      {lives <= 0 || wave >= 4 ? 'VIEW RESULTS ▶' : 'NEXT ENEMY ▶'}
                    </button>
                  </div>
                </motion.div>
              )}

              {gameState === 'END' && (
                <motion.div 
                  key="end"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-sm flex flex-col items-center"
                >
                  <div className="bg-slate-900/90 border-4 border-white p-8 rounded-xl w-full text-center shadow-2xl relative z-20">
                    
                    <div className="text-2xl md:text-3xl mb-2 text-sky-400 drop-shadow-md">
                      {lives > 0 ? (score >= 40 ? 'PERFECT!' : 'YOU WIN!') : 'GAME OVER'}
                    </div>

                    <div className="bg-sky-900/50 border-2 border-sky-400 p-4 rounded-lg my-6">
                      <div className="text-sky-200 text-[10px] mb-2">FINAL SCORE</div>
                      <div className="text-3xl text-yellow-400 mb-2">{score}</div>
                      <div className="text-xs text-sky-100">
                        {score >= 40 ? 'S RANK' : score >= 25 ? 'A RANK' : score >= 15 ? 'B RANK' : 'C RANK'}
                      </div>
                    </div>

                    <div className="text-[9px] md:text-[10px] text-sky-200 leading-loose mb-8 text-left max-w-[200px] mx-auto border-t border-sky-800 pt-4">
                      Correct Calls: {history.filter(Boolean).length}/5 <br/>
                      Lives Left: {lives}/3
                    </div>

                    <button 
                      onClick={startGame}
                      className="w-full bg-green-500 hover:bg-green-400 text-slate-900 text-xs py-4 border-4 border-white retro-border retro-border-active tracking-wider"
                    >
                      ▶ PLAY AGAIN
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
      
    </div>
  );
}
