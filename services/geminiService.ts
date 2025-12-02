import { GoogleGenAI, Type } from "@google/genai";
import { RequirementItem } from "../types";

export const analyzeScreenshot = async (base64Image: string, apiKey?: string): Promise<RequirementItem[]> => {
  // Use provided key or fallback to environment variable
  const finalApiKey = apiKey || process.env.API_KEY;
  
  if (!finalApiKey) {
    throw new Error("API Key is missing. Please set it in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey: finalApiKey });

  try {
    // Strip the data URL prefix if present to get just the base64 string
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const model = "gemini-2.5-flash";

    // Updated prompt for Chinese PRD generation with Region grouping
    const prompt = `
      作为一名高级产品经理，请分析这张 UI 界面截图，并将其拆解为产品需求列表（PRD）。
      
      请按照视觉区域对功能进行分组（例如：“查询条件区”、“数据列表区”、“导航栏”、“操作区”）。
      
      **重要过滤规则**：
      - 请忽略纯技术组件区域，如“分页器”、“页面消息提示”、“全局Toast”、“面包屑导航”。
      - 只需要关注具体的业务功能点。
      
      对于每个识别到的功能点（如输入框标签、按钮文字、表头字段）：
      1. 'region': 填写所属区域名称 (中文)。
      2. 'functionName': 填写界面上显示的名称（字段名或按钮名）。
      3. 其他字段 ('description', 'interaction', 'validation', 'scope') 请保持为空字符串，留给用户后续填写。
      
      请确保返回标准的 JSON 格式。
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Data,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              region: { type: Type.STRING },
              functionName: { type: Type.STRING },
              description: { type: Type.STRING },
              interaction: { type: Type.STRING },
              validation: { type: Type.STRING },
              scope: { type: Type.STRING },
            },
            required: ["region", "functionName"],
          },
        },
      },
    });

    const jsonStr = response.text;
    if (!jsonStr) {
      throw new Error("No response from AI");
    }

    const parsedItems = JSON.parse(jsonStr) as Omit<RequirementItem, 'id'>[];

    // Add client-side IDs and ensure empty fields are empty strings
    return parsedItems.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      description: item.description || "",
      interaction: item.interaction || "",
      validation: item.validation || "",
      scope: item.scope || "",
    }));

  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};