import { TestBed, async } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { KnowledgeGraphState } from './knowledge-graph.state';
import { KnowledgeGraphAction } from './knowledge-graph.actions';

describe('KnowledgeGraph actions', () => {
  let store: Store;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([KnowledgeGraphState])]
    }).compileComponents();
    store = TestBed.get(Store);
  }));

  it('should create an action and add an item', () => {
    store.dispatch(new KnowledgeGraphAction('item-1'));
    store.select(state => state.knowledgeGraph.items).subscribe((items: string[]) => {
      expect(items).toEqual(jasmine.objectContaining([ 'item-1' ]));
    });
  });

});
