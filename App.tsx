
import React, { useState, useCallback } from 'https://esm.sh/react@19.0.0';
import { GameState, ApiResponse } from './types';
import { testCommunication, getGeminiHint } from './services/geminiService';
import Modal from './components/Modal';

const App: React.FC = () => {
  const [game, setGame] = useState<GameState>({
    target: Math.floor(Math.random() * 100) + 1,
    guesses: [],
    feedback: "1에서 100 사이의 숫자를 맞춰보세요!",
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
      feedback: "새로운 게임이 시작되었습니다! 행운을 빌어요.",
      isGameOver: false,
      attempts: 0,
    });
    setInputValue("");
  }, []);

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    const guess = parseInt(inputValue);

    if (isNaN(guess) || guess < 1 || guess > 100) {
      alert("1에서 100 사이의 유효한 숫자를 입력해주세요.");
      return;
    }

    if (game.guesses.includes(guess)) {
      alert("이미 시도했던 숫자입니다.");
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
        feedback: `정답입니다! 🎉 ${newAttempts}번 만에 맞추셨네요.`,
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

  const runApiTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testCommunication();
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      {/* Header */}
      <div className="w-full max-w-lg mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          Gemini 숫자 스무고개
        </h1>
        <p className="text-slate-400">인공지능 Gemini가 당신의 추측을 도와줍니다.</p>
      </div>

      {/* Main Game Card */}
      <div className="w-full max-w-lg bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="mb-6 text-center">
            <p className={`text-lg font-medium transition-all duration-300 ${game.isGameOver ? 'text-green-400 scale-110' : 'text-blue-200'}`}>
              {game.feedback}
            </p>
          </div>

          {!game.isGameOver ? (
            <form onSubmit={handleGuess} className="space-y-4">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="숫자를 입력하세요 (1-100)"
                className="w-full bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-2xl text-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    분석 중...
                  </span>
                ) : "추측하기"}
              </button>
            </form>
          ) : (
            <button
              onClick={startNewGame}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              다시 시작하기
            </button>
          )}

          <div className="mt-10 flex flex-wrap gap-2 justify-center">
            {game.guesses.map((guess, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-full text-sm text-slate-300"
              >
                {guess}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 border-t border-slate-700 flex justify-between items-center text-sm text-slate-500">
          <span>시도 횟수: <span className="text-white font-bold">{game.attempts}</span></span>
          <button 
            onClick={() => {
              setTestResult(null);
              setIsTestModalOpen(true);
            }}
            className="hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            API 통신 테스트
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isTestModalOpen} 
        onClose={() => setIsTestModalOpen(false)} 
        title="API 통신 테스트"
      >
        <div className="space-y-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            Gemini API와의 연결 상태를 확인합니다. 이 테스트는 주입된 <code className="bg-slate-900 px-1 rounded text-blue-400">process.env.API_KEY</code>를 사용합니다.
          </p>
          
          <button
            onClick={runApiTest}
            disabled={isTesting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isTesting && (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            통신 테스트 실행
          </button>

          {testResult && (
            <div className={`p-4 rounded-xl border ${testResult.success ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{testResult.success ? "✅ 테스트 성공" : "❌ 테스트 실패"}</span>
              </div>
              <p className="text-sm opacity-90">{testResult.message}</p>
              {testResult.data && (
                <div className="mt-3 p-2 bg-slate-900 rounded-lg text-xs font-mono text-slate-400">
                  응답 데이터: {testResult.data}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <footer className="mt-12 text-slate-600 text-sm">
        Powered by Gemini 3 Flash & Tailwind CSS
      </footer>
    </div>
  );
};

export default App;
