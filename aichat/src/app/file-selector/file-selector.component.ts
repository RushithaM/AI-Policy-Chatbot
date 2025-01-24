import { Component, OnInit } from '@angular/core';
import { AiService } from '../ai.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface File {
  id: number;
  name: string;
  context: string;
}

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class FileSelectorComponent implements OnInit {
  files: File[] = [];
  filteredFiles: File[] = [];
  selectedFile: File | null = null;
  searchTerm: string = '';

  constructor(private aiService: AiService) { }

  ngOnInit(): void {
    this.aiService.getFiles().subscribe(
      (data: File[]) => {
        this.files = data;
        this.filteredFiles = data;
      },
      (error) => {
        console.error('Error fetching files:', error);
      }
    );
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredFiles = this.files;
      return;
    }
    
    this.filteredFiles = this.files.filter(file => 
      file.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onFileSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const fileId = parseInt(select.value);
    this.selectedFile = this.files.find(file => file.id === fileId) || null;
    this.aiService.setSelectedFile(this.selectedFile);
  }
}