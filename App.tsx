import React, { useState, useCallback } from 'https://esm.sh/react@19.0.0';
import { GameState, ApiResponse } from './types.ts';
import { testCommunication, getGeminiHint } from './services/geminiService.ts';
import Modal from './components/Modal.tsx';

const App: React.FC = () => {
  const [game, setGame] = useState<GameState>({
    target: Math.floor(Math.random() * 100) + 1,
    guesses: [],
    feedback: "1부터 100 사이의 숫자를 맞춰보세요!",
    isGameOver: false,
    attempts: 0,
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<ApiResponse | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const startNewGame = useCallback(() => {
    setGame({
      target: Math.floor(Math.random() * 100) + 1,
      guesses: [],
      feedback: "준비되셨나요? 다시 시작합니다!",
      isGameOver: false,
      attempts: 0,
    });
    setInputValue("");
  }, []);

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    const guess = parseInt(inputValue);

    if (isNaN(guess) || guess < 1 || guess > 100) {
      alert("1에서 100 사이의 숫자를 입력해주세요.");
      return;
    }

    if (game.guesses.includes(guess)) {
      alert("이미 시도한 숫자입니다.");
      return;
    }

    setIsLoading(true);
    const newGuesses = [...game.guesses, guess];
    const newAttempts = game.attempts + 1;

    if (guess === game.target) {
      setGame(prev => ({
        ...prev,
        guesses: newGuesses,
        attempts: newAttempts,
        feedback: `축하합니다! 🎉 ${newAttempts}번 만에 맞추셨어요. 정답은 ${game.target}입니다!`,
        isGameOver: true
      }));
    } else {
      const hint = await getGeminiHint(game.target, guess);
      setGame(prev => ({
        ...prev,
        guesses: newGuesses,
        attempts: newAttempts,
        feedback: hint
      }));
    }

    setInputValue("");
    setIsLoading(false);
  };

  const handleTestApi = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testCommunication();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: "치명적인 오류가 발생했습니다." });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all">
        <div className="p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">NUMBER GUESS</h1>
            <p className="text-slate-500 text-sm font-medium">with Gemini AI</p>
          </header>

          <div className="mb-8 p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50 min-h-[100px] flex items-center justify-center text-center">
            <p className={`text-lg font-semibold leading-snug transition-all ${game.isGameOver ? 'text-yellow-400' : 'text-blue-400'}`}>
              {game.feedback}
            </p>
          </div>

          {!game.isGameOver ? (
            <form onSubmit={handleGuess} className="space-y-4">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="?"
                className="w-full bg-slate-800 border-2 border-slate-700 text-white text-4xl font-bold py-6 rounded-2xl text-center focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-700"
                disabled={isLoading}
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? "분석 중..." : "추측하기"}
              </button>
            </form>
          ) : (
            <button
              onClick={startNewGame}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-yellow-900/20"
            >
              다시 시작하기
            </button>
          )}

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {game.guesses.map((g, i) => (
              <span key={i} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg text-sm font-bold text-slate-400 border border-slate-700">
                {g}
              </span>
            ))}
          </div>
        </div>

        <footer className="bg-slate-950/50 p-6 border-t border-slate-800 flex justify-between items-center">
          <div className="text-slate-500 text-sm">
            시도 횟수: <span className="text-white font-bold">{game.attempts}</span>
          </div>
          <button 
            onClick={() => {
              setTestResult(null);
              setIsTestModalOpen(true);
            }}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-full font-bold transition-all"
          >
            API 연결 테스트
          </button>
        </footer>
      </div>

      <Modal 
        isOpen={isTestModalOpen} 
        onClose={() => setIsTestModalOpen(false)} 
        title="API 통신 테스트"
      >
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            설정된 API 키를 사용하여 Gemini 서버와 통신을 시도합니다.
          </p>
          
          <button
            onClick={handleTestApi}
            disabled={isTesting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all disabled:bg-slate-700"
          >
            {isTesting ? "테스트 중..." : "통신 테스트 시작"}
          </button>

          {testResult && (
            <div className={`p-4 rounded-xl border ${testResult.success ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/10 border-rose-500/50 text-rose-400'}`}>
              <p className="font-bold mb-1">{testResult.success ? "성공" : "실패"}</p>
              <p className="text-sm opacity-80">{testResult.message}</p>
              {testResult.data && (
                <div className="mt-2 text-xs font-mono bg-black/30 p-2 rounded">
                  응답: {testResult.data}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default App;