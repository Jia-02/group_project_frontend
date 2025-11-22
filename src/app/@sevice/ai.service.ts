import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = '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';

  constructor(private http: HttpClient) { }

  async generateActivity(text: string): Promise<any> {
    const body = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
請解析以下活動描述，回傳 JSON 格式，包含：
{
  "title": "",
  "description": "",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}
活動描述：
${text}
`
        }
      ]
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const res: any = await firstValueFrom(this.http.post(this.apiUrl, body, { headers }));

    return JSON.parse(res.choices[0].message.content);
  }
}
