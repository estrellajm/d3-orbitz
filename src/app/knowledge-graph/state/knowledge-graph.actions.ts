import { Planet } from "../interfaces/planets.interface";

export class GetPlanets {
  static readonly type = '[KnowledgeGraph] Gets Planet';
}
export class KnowledgeGraphAddPlanet {
  static readonly type = '[KnowledgeGraph] Add Planet';
  constructor(public planet: Planet) { }
}
