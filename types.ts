export interface RequirementItem {
  id: string;
  region: string; // e.g., "查询区", "列表区"
  functionName: string; // e.g., "客户名称"
  description: string;
  interaction: string;
  validation: string;
  scope: string;
}

export interface AnalysisResult {
  items: RequirementItem[];
}