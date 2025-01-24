import { Component, OnInit, OnDestroy } from '@angular/core';
import { AiService } from '../ai.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-response',
  templateUrl: './ai-response.component.html',
  styleUrls: ['./ai-response.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AiResponseComponent implements OnInit, OnDestroy {
  response: string = '';
  private subscription: Subscription = new Subscription();

  constructor(private aiService: AiService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.aiService.getAiResponse().subscribe(
        response => {
          this.response = response;
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}