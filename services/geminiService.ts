
import { GoogleGenAI } from "@google/genai";
import { ApiResponse } from "../types";

export const testCommunication = async (): Promise<ApiResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "API 통신 테스트입니다. '성공'이라고 짧게 대답해주세요.",
    });

    if (response.text) {
      return { success: true, message: "통신 성공!", data: response.text.trim() };
    }
    return { success: false, message: "응답 내용이 없습니다." };
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: error instanceof Error ? error.message : "알 수 없는 오류 발생" };
  }
};

export const getGeminiHint = async (target: number, lastGuess: number): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
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

    return response.text || "힌트를 가져오지 못했습니다.";
  } catch (error) {
    console.error("Hint API Error:", error);
    return lastGuess < target ? "UP!" : "DOWN!";
  }
};
