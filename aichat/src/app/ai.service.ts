import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Message } from './models/message.interface';

interface File {
  id: number;
  name: string;
  context: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private selectedFile = new BehaviorSubject<File | null>(null);
  private aiResponse = new BehaviorSubject<string>('');
  private readonly API_KEY = 'API_KEY';
  private readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  private messages = new BehaviorSubject<Message[]>([]);
  private messageId = 0;

  constructor(private http: HttpClient) { }

  getFiles(): Observable<File[]> {
    return this.http.get<File[]>('assets/files.json').pipe(
      tap(files => console.log('Loaded files:', files)),
      catchError(error => {
        console.error('Error loading files:', error);
        return [];
      })
    );
  }

  setSelectedFile(file: File | null): void {
    this.selectedFile.next(file);
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

      const params = new HttpParams().set('key', this.API_KEY);
      
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json');

      const payload = {
        contents: [{
          parts: [{
            text: `Using this context: "${file.context}", please answer the following question: "${question}". Provide a concise and relevant answer based only on the given context.`
          }]
        }]
      };

      this.http.post(this.API_URL, payload, { headers, params }).pipe(
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