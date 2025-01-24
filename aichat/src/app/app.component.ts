import { Component } from '@angular/core';
import { ChatInterfaceComponent } from './chat-interface/chat-interface.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    ChatInterfaceComponent
  ],
  standalone: true
})
export class AppComponent {
  title = 'AI Chat Application';
}