import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  apiUrl = 'https://api.openai.com/v1/chat/completions';
  apiKey = '';

  constructor(private httpClient: HttpClient){}

  postAi(postData: string): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`
  });

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      {role: 'user',
        content: `
請解析以下活動描述，回傳 JSON 格式，包含：
{
  "title": "",
  "description": "",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}
活動內容：
${postData}
        `}
    ]
  };

  return this.httpClient.post(this.apiUrl, body, { headers });
}

}

// content: `
// 請解析以下活動描述，回傳 JSON 格式，包含：
// {
//   "title": "",
//   "description": "",
//   "startDate": "YYYY-MM-DD",
//   "endDate": "YYYY-MM-DD"
// }
// 活動內容：
// ${text}
