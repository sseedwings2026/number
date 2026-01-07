import { GoogleGenAI } from "https://esm.sh/@google/genai@1.34.0";
import { ApiResponse } from "../types.ts";

export const testCommunication = async (): Promise<ApiResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "이 메시지가 보인다면 API 통신이 성공한 것입니다. '연결 성공'이라고 짧게 답변해줘.",
    });

    if (response.text) {
      return { success: true, message: "통신 성공!", data: response.text.trim() };
    }
    return { success: false, message: "응답 값이 비어있습니다." };
  } catch (error: any) {
    console.error("API Test Error:", error);
    return { success: false, message: error?.message || "통신 중 오류가 발생했습니다." };
  }
};

export const getGeminiHint = async (target: number, lastGuess: number): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const diff = Math.abs(target - lastGuess);
    const direction = lastGuess < target ? "더 높은 숫자" : "더 낮은 숫자";
    
    let proximity = "멀리 있는";
    if (diff <= 5) proximity = "아주 가까운";
    else if (diff <= 15) proximity = "근처의";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `숫자 맞추기 게임 중입니다. 정답은 ${target}이고 사용자는 ${lastGuess}를 입력했습니다. 정답은 ${direction}입니다. 현재 위치가 정답과 ${proximity} 상태임을 언급하며 사용자에게 한 문장의 짧고 위트 있는 힌트를 한국어로 주세요.`,
    });

    return response.text || (lastGuess < target ? "더 높이 올라가세요!" : "조금 내려오세요!");
  } catch (error) {
    console.error("Hint API Error:", error);
    return lastGuess < target ? "UP!" : "DOWN!";
  }
};