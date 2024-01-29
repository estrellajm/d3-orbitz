import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { KnowledgeGraphComponent } from './knowledge-graph.component';
import { KnowledgeGraphState } from './state/knowledge-graph.state';
import { FormsModule } from '@angular/forms';

const components = [KnowledgeGraphComponent];

@NgModule({
  declarations: [...components],
  exports: [...components],
  imports: [CommonModule, NgxsModule.forFeature([KnowledgeGraphState]), FormsModule],
})
export class KnowledgeGraphModule {}
