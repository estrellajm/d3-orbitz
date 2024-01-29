import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';
import { Planet } from '../interfaces/planets.interface';
import { KnowledgeGraphService } from '../services/knowledge-graph.service';
import { GetPlanets, KnowledgeGraphAddPlanet } from './knowledge-graph.actions';

export class KnowledgeGraphStateModel {
  public planets: Planet[] = [];
}

const defaults: KnowledgeGraphStateModel = {
  planets: [],
};

@State<KnowledgeGraphStateModel>({
  name: 'knowledgeGraph',
  defaults,
})
@Injectable()
export class KnowledgeGraphState implements NgxsOnInit {
  knowledgeGraphService = inject(KnowledgeGraphService);
  ngxsOnInit(ctx: StateContext<KnowledgeGraphStateModel>) {
    // console.log('State initialized, now getting animals');
    ctx.dispatch(new GetPlanets());
  }

  @Action(GetPlanets)
  async getPlanets({ setState }: StateContext<KnowledgeGraphStateModel>) {
    const planets = await firstValueFrom(
      this.knowledgeGraphService.getPlanets()
    );
    setState({ planets: planets });
  }

  @Action(KnowledgeGraphAddPlanet)
  add(
    { getState, setState }: StateContext<KnowledgeGraphStateModel>,
    { planet }: KnowledgeGraphAddPlanet
  ) {
    const state = getState();
    setState({ planets: [...state.planets, planet] });
  }
}
