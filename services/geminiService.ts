
import { GoogleGenAI } from "https://esm.sh/@google/genai@1.34.0";
import { ApiResponse } from "../types.ts";

// 안전하게 API 키를 가져오는 헬퍼 함수
const getApiKey = (): string => {
  try {
    // 다양한 환경(Node, Browser, Injected)에서의 process.env 대응
    const env = (window as any).process?.env || (globalThis as any).process?.env || {};
    return env.API_KEY || "";
  } catch {
    return "";
  }
};

export const testCommunication = async (): Promise<ApiResponse> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, message: "API 키를 찾을 수 없습니다. Vercel 환경 변수 설정을 확인해주세요." };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "API 통신 테스트입니다. '성공'이라고 짧게 대답해주세요.",
    });

    if (response.text) {
      return { success: true, message: "통신 성공!", data: response.text.trim() };
    }
    return { success: false, message: "응답 내용이 없습니다." };
  } catch (error: any) {
    console.error("API Error:", error);
    return { success: false, message: error?.message || "알 수 없는 오류 발생" };
  }
};

export const getGeminiHint = async (target: number, lastGuess: number): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return lastGuess < target ? "UP! (API 키가 설정되지 않았습니다)" : "DOWN! (API 키가 설정되지 않았습니다)";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const diff = Math.abs(target - lastGuess);
    const direction = lastGuess < target ? "더 높은 숫자" : "더 낮은 숫자";
    
    let proximity = "조금";
    if (diff > 50) proximity = "아주 많이";
    else if (diff > 20) proximity = "상당히";
    else if (diff < 5) proximity = "아주 가까운";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `사용자가 1~100 사이 숫자 중 ${lastGuess}를 입력했습니다. 정답은 ${target}입니다. ${proximity} ${direction}가 정답이라고 위트 있게 힌트를 한 문장으로 한국어로 말해주세요.`,
    });

    return response.text || (lastGuess < target ? "UP!" : "DOWN!");
  } catch (error) {
    console.error("Hint API Error:", error);
    return lastGuess < target ? "UP!" : "DOWN!";
  }
};
