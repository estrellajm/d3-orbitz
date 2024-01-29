export interface Planet {
  name: string;
  moons: Moon[];
}

export interface Moon {
  name: string;
  satellites: Satellite[];
}

export interface Satellite {
  name: string;
}
