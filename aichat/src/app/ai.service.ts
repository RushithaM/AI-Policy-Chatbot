import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Message } from './models/message.interface';

interface File {
  id: number;
  name: string;
  url: string;
  context: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'http://localhost:3000/api';
  private API_KEY = 'AIzaSyBORV1ABtDwX5b9d2If568PV_6vmUO3-74';
  private API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  private selectedFile = new BehaviorSubject<File | null>(null);
  private aiResponse = new BehaviorSubject<string>('');
  private messages = new BehaviorSubject<Message[]>([]);
  private messageId = 0;

  constructor(private http: HttpClient) { }

  getFiles(): Observable<File[]> {
    return this.http.get<File[]>(`${this.apiUrl}/policies`);
  }

  extractFileContent(url: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/policies/extract`, { url });
  }

  setSelectedFile(file: File | null): void {
    if (file && !file.context) {
      this.extractFileContent(file.url).subscribe(
        response => {
          file.context = response.text;
          this.selectedFile.next(file);
        },
        error => {
          console.error('Error extracting file content:', error);
        }
      );
    } else {
      this.selectedFile.next(file);
    }
  }

  askQuestion(question: string): Observable<string> {
    return new Observable(observer => {
      const file = this.selectedFile.getValue();
      
      if (!file) {
        const response = 'Please select a file before asking a question.';
        this.aiResponse.next(response);
        observer.next(response);
        observer.complete();
        return;
      }

      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('x-goog-api-key', this.API_KEY);

      const payload = {
        contents: [{
          parts: [{
            text: `Using this context: "${file.context}", please answer the following question: "${question}". Provide a concise and relevant answer based only on the given context.`
          }]
        }]
      };

      this.http.post(this.API_URL, payload, { headers }).pipe(
        map((response: any) => {
          console.log('API Response:', response);
          if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
            return response.candidates[0].content.parts[0].text;
          }
          throw new Error('Invalid response format');
        }),
        catchError(error => {
          console.error('API Error:', error);
          throw new Error('Failed to get response from AI');
        })
      ).subscribe(
        (answer: string) => {
          this.aiResponse.next(answer);
          observer.next(answer);
          observer.complete();
        },
        error => {
          console.error('Error details:', error);
          const errorMessage = 'Sorry, I encountered an error while processing your question. Please try again later.';
          this.aiResponse.next(errorMessage);
          observer.next(errorMessage);
          observer.complete();
        }
      );
    });
  }

  getSelectedFile(): Observable<File | null> {
    return this.selectedFile.asObservable();
  }

  getAiResponse(): Observable<string> {
    return this.aiResponse.asObservable();
  }

  getMessages(): Observable<Message[]> {
    return this.messages.asObservable();
  }

  addMessage(text: string, isUser: boolean): void {
    const message: Message = {
      id: ++this.messageId,
      text,
      isUser,
      timestamp: new Date()
    };
    const currentMessages = this.messages.getValue();
    this.messages.next([...currentMessages, message]);
  }
}