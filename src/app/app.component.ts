import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KnowledgeGraphModule } from './knowledge-graph/knowledge-graph.module';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, KnowledgeGraphModule],
})
export class AppComponent {}
