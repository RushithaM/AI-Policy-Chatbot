import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AiService } from '../ai.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message } from '../models/message.interface';

interface File {
  id: number;
  name: string;
  context: string;
}

@Component({
  selector: 'app-chat-interface',
  templateUrl: './chat-interface.component.html',
  styleUrls: ['./chat-interface.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ChatInterfaceComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  question: string = '';
  messages: Message[] = [];
  files: File[] = [];
  selectedFile: File | null = null;

  constructor(private aiService: AiService) { }

  ngOnInit(): void {
    this.aiService.getFiles().subscribe(
      (data: File[]) => {
        this.files = data;
      }
    );

    this.aiService.getMessages().subscribe(
      messages => {
        this.messages = messages;
      }
    );

    this.aiService.getSelectedFile().subscribe(
      file => {
        this.selectedFile = file;
      }
    );
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = 
        this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  onFileSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const fileId = parseInt(select.value);
    this.selectedFile = this.files.find(file => file.id === fileId) || null;
    this.aiService.setSelectedFile(this.selectedFile);
  }

  askQuestion(): void {
    if (this.question.trim()) {
      this.aiService.addMessage(this.question, true);
      
      this.aiService.askQuestion(this.question).subscribe(
        (response: string) => {
          this.aiService.addMessage(response, false);
          this.question = ''; // Clear the input after asking
        },
        (error) => {
          console.error('Error details:', error);
          this.aiService.addMessage('Sorry, an error occurred. Please try again.', false);
        }
      );
    }
  }

  changeFile(): void {
    this.selectedFile = null;
    this.aiService.setSelectedFile(null);
  }
}