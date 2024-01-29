import { Selector } from '@ngxs/store';
import { Planet } from '../interfaces/planets.interface';
import {
  KnowledgeGraphState,
  KnowledgeGraphStateModel,
} from './knowledge-graph.state';

export class knowledgeGraphSelectors {
  @Selector([KnowledgeGraphState])
  static getPlanets(state: KnowledgeGraphStateModel): Planet[] {
    return state.planets;
  }
}
