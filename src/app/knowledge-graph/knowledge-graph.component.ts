import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import * as d3 from 'd3';
import { Observable } from 'rxjs';
import { Moon, Planet } from './interfaces/planets.interface';
import { KnowledgeGraphAddPlanet } from './state/knowledge-graph.actions';
import { knowledgeGraphSelectors } from './state/knowledge-graph.selectors';

@Component({
  selector: 'app-knowledge-graph',
  templateUrl: './knowledge-graph.component.html',
  styleUrl: './knowledge-graph.component.scss',
})
export class KnowledgeGraphComponent {
  @Select(knowledgeGraphSelectors.getPlanets) planets$!: Observable<Planet[]>;

  @ViewChild('svgContainer', { static: true }) private container!: ElementRef;
  dashArrayValue1 = 0;
  dashArrayValue2 = 16;
  circleSize = 318;

  coreSVG: any;
  svg: any;
  mainOrbit: any;
  width: number = 900;
  height: number = 900;
  mainOrbitRadius: number = 300;
  planets: Planet[] = [];
  zoomBehavior: any;
  zoomScale: number = 2;

  store = inject(Store);

  ngOnInit(): void {
    this.initVis();
    // this.setupZoom(); // not working
    this.planets$.subscribe((planets) => {
      if (planets.length <= 0) return;
      this.planets = planets;
      this.mainOrbitPlanets();
    });
  }

  // setupZoom() {
  //   this.zoomBehavior = d3
  //     .zoom()
  //     .scaleExtent([1, 8]) // Set the scale limit
  //     .on('zoom', (event) => {
  //       console.log(event);

  //       this.svg.attr('transform', event.transform);
  //     });

  //   d3.select(this.container.nativeElement)
  //     .select('svg')
  //     .call(this.zoomBehavior);
  // }

  initVis(): void {
    const ngOrbit = this;
    const element = this.container.nativeElement;
    /** Set initial dimensions  */
    this.width = element.offsetWidth;
    this.height = element.offsetHeight;

    this.coreSVG = d3
      .select(element)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', 'bg-[#0A1439]');

    /** Main svg init */
    this.svg = this.coreSVG
      .append('g')
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

    /** TODO: REMOVE Adding a dot at the center. This is where the center blur should go */
    this.svg
      .append('circle')
      .attr('cx', 0) // Center of the group element
      .attr('cy', 0) // Center of the group element
      .attr('r', 30) // Radius of the dot
      .attr('class', 'fill-red-300'); // Radius of the dot

    /** Adding text at the center */
    this.svg
      .append('text')
      .attr('x', 0) // Center of the group element
      .attr('y', 0) // Center of the group element
      .attr('text-anchor', 'middle') // Ensure the text is centered horizontally
      .attr('dominant-baseline', 'middle') // Ensure the text is centered vertically
      .text('Center') // The text to display
      .style('fill', 'black'); // Color of the text

    const defs = this.svg.append('defs');
    // Define Gaussian blur filter
    const blurFilter = defs
      .append('filter')
      .attr('id', 'large-blur')
      .append('feGaussianBlur')
      .attr('stdDeviation', 54); // Blur strength

    // Define linear gradient
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'orbit-gradient')
      .attr('gradientTransform', 'rotate(66)'); // Adjust the angle as needed

    gradient
      .append('stop')
      .attr('offset', '3.63%')
      .attr('stop-color', '#0A1439');

    gradient
      .append('stop')
      .attr('offset', '104.66%')
      .attr('stop-color', '#1E22FF');

    /** Main Orbit Line */
    this.mainOrbit = this.svg
      .append('circle')
      .attr('class', 'cursor-pointer')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', this.mainOrbitRadius)
      // .style('stroke', 'black')
      // .style('stroke-opacity', 0.2)
      // .style('stroke-width', 4)
      // .style(
      //   'stroke-dasharray',
      //   `${this.dashArrayValue1},${this.dashArrayValue2}`
      // )
      // .style('stroke-linecap', 'round')
      .style('fill', 'blue')
      .style('fill-opacity', 1)
      .style('fill', 'url(#orbit-gradient)')
      .on('click', function (event: any, d: Planet) {
        ngOrbit.resetZoom();
      });
  }

  mainOrbitPlanets(): void {
    const ngOrbit = this;
    // Update or initialize positions of planet groups
    const planetGroups = this.svg
      .selectAll('g.planet-group')
      .data(this.planets);

    planetGroups.attr('transform', (d: Planet, i: number) => {
      const position = this.calcMainOrbitPlanetPosition(i);
      return `translate(${position.x}, ${position.y})`;
    });

    // Append new planet groups for new data elements
    const newPlanetGroups = planetGroups
      .enter()
      .append('g')
      .attr('id', (d: Planet) => `planet-${this.formatForID(d.name)}`)
      .attr('class', 'planet-group')
      .attr('transform', (d: Planet, i: number) => {
        const position = this.calcMainOrbitPlanetPosition(i);
        return `translate(${position.x}, ${position.y})`;
      })
      .on('click', function (event: any, d: Planet) {
        // Create a D3 selection from the clicked DOM element
        // @ts-ignore
        const clickedElement = d3.select(this);

        // Get the transform attribute
        const transform = clickedElement.attr('transform');

        const translateValues = transform.match(/translate\(([^,]+),([^)]+)\)/);
        if (translateValues) {
          const x = parseFloat(translateValues[1]);
          const y = parseFloat(translateValues[2]);
          // You can call your zoom function here, passing x, y, and scale
          ngOrbit.zoomToPlanet(d, { x, y }, 2);
        }
      });

    // Append circles to new planet groups
    newPlanetGroups
      .append('circle')
      .attr('class', 'lob cursor-pointer')
      .attr('id', (d: Planet) => `planet-${this.formatForID(d.name)}`)
      .attr('r', 50) // Adjust the radius as needed
      .style('fill', 'blue'); // Style the planet

    // Append text to new planet groups
    newPlanetGroups
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle') // Center the text horizontally
      .attr('dominant-baseline', 'central') // Center the text vertically
      .text((d: Planet) => d.name) // Display the planet's name
      .style('fill', 'white'); // Adjust text color as needed

    // Remove any old elements that no longer exist in the data
    planetGroups.exit().remove();
  }

  private calcMainOrbitPlanetPosition(index: number) {
    // Calculate the angle step for even spacing
    const angleStep = (2 * Math.PI) / this.planets.length;

    // Calculate position based on index and angleStep
    const angle = index * angleStep;
    return {
      x: this.mainOrbitRadius * Math.cos(angle),
      y: this.mainOrbitRadius * Math.sin(angle),
    };
  }

  private zoomToPlanet(
    planet: Planet,
    coords: { x: number; y: number },
    scale: number
  ) {
    // Calculate the translate position for zoom
    const translate = [
      this.width / 2 - scale * coords.x,
      this.height / 2 - scale * coords.y,
    ];

    // Apply the transform
    this.svg
      .transition()
      .duration(750) // Transition duration
      .attr(
        'transform',
        `translate(${translate[0]}, ${translate[1]}) scale(${scale})`
      );
    /** Code below is not working. chosing above for now */
    // .call(this.zoomBehavior.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

    this.svg.selectAll('.moon-group').remove();
    this.svg.selectAll('.moon-orbit-ring').remove();
    // Draw moons or children for the selected planet
    this.drawMoons(planet, coords, scale);
  }

  private zoomToMoon(
    moon: Moon,
    coords: { x: number; y: number },
    scale: number
  ) {
    // Calculate the translate position for zoom
    const translate = [
      this.width / 2 - scale * coords.x,
      this.height / 2 - scale * coords.y,
    ];

    // Apply the transform
    this.svg
      .transition()
      .duration(750) // Transition duration
      .attr(
        'transform',
        `translate(${translate[0]}, ${translate[1]}) scale(${scale})`
      );
    this.buildMoonOrbits(moon, coords);
  }

  buildMoonOrbits(moon: Moon, coords: { x: number; y: number }): void {
    this.svg
      .selectAll(`#moon-outer-ring-${this.formatForID(moon.name)}`)
      .remove();
    // Define a scale for the orbits if necessary
    const orbitScale = d3
      .scaleLinear()
      .domain([0, this.planets.length])
      .range([18, 60]); // Adjust the range based on your visualization

    moon.satellites.forEach((satellite, index) => {
      // Draw orbits
      this.svg
        .append('circle')
        .attr('class', 'moon-orbit-ring')
        .attr('cx', coords.x)
        .attr('cy', coords.y)
        .attr('r', orbitScale(index))
        .style('fill', 'none')
        .style('stroke', 'white')
        .style('stroke-width', 1)
        .style('stroke-opacity', 0.9);
    });
  }

  private drawMoons(
    planet: Planet,
    coords: { x: number; y: number },
    scale: number
  ) {
    const ngOrbit = this;
    // Create moon orbit group
    const moonOrbitGroup = this.svg
      .append('g')
      .attr('class', 'moon-orbit-group')
      .attr('transform', `translate(${coords.x}, ${coords.y})`);

    // Draw moon orbit
    moonOrbitGroup
      .append('circle')
      .attr('class', 'moon-orbit-line')
      .attr('r', 100) // moon orbit radius
      .style('stroke', 'white')
      .style('stroke-opacity', 0.9)
      .style('stroke-width', 1)
      .style('fill', 'none')
      .style('stroke-dasharray', `0,5`)
      .style('stroke-linecap', 'round');

    // Example: Assuming each planet object has a 'moons' array
    planet.moons.forEach((moon, index) => {
      // Calculate position for each moon and it's orbit

      const moonOrbitRadius = this.calculateMoonOrbitRadius(moon, scale);
      const moonPosition = this.calcMoonOrbitPosition(
        planet,
        moon,
        coords,
        index,
        scale,
        moonOrbitRadius
      );

      // Create moon group
      const moonGroup = this.svg
        .append('g')
        .attr('class', 'moon-group cursor-pointer')
        .attr('transform', `translate(${moonPosition.x}, ${moonPosition.y})`)
        .on('click', function (event: any, d: Planet) {
          // Create a D3 selection from the clicked DOM element
          // @ts-ignore
          const clickedElement = d3.select(this);

          // Get the transform attribute
          const transform = clickedElement.attr('transform');

          const translateValues = transform.match(
            /translate\(([^,]+),([^)]+)\)/
          );

          if (translateValues) {
            const x = parseFloat(translateValues[1]);
            const y = parseFloat(translateValues[2]);
            // You can call your zoom function here, passing x, y, and scale
            const isMoon = true;
            ngOrbit.zoomToMoon(moon, { x, y }, 4);
          }
        });

      // Draw moon
      moonGroup
        .append('circle')
        .attr('id', `moon-outer-ring-${this.formatForID(moon.name)}`)
        .attr('class', 'moon-outer-ring')
        .attr('r', 15) // Adjust size as needed
        .style('fill', 'none') // Style for moon
        .style('stroke', '#AAC5FF'); // Style for moon

      moonGroup
        .append('circle')
        .attr('class', 'moon')
        .attr('r', 10) // Adjust size as needed
        .style('fill', '#AAC5FF'); // Style for moon
    });
  }

  private calcMoonOrbitPosition(
    planet: Planet,
    moon: Moon,
    coords: { x: number; y: number },
    index: number,
    scale: number,
    moonOrbitRadius: number
  ): { x: number; y: number } {
    // Example calculation, adjust as needed based on your data structure
    const angleStep = (2 * Math.PI) / planet.moons.length;
    const angle = index * angleStep;

    return {
      x: coords.x + moonOrbitRadius * Math.cos(angle),
      y: coords.y + moonOrbitRadius * Math.sin(angle),
    };
  }

  private calculateMoonOrbitRadius(moon: Moon, scale: number): number {
    // Calculate the orbit radius for the moon
    // This can be a static value or based on moon properties (if available)
    const baseOrbitRadius = 50; // moon orbit
    return baseOrbitRadius * scale;
  }

  resetZoom() {
    this.svg
      .transition()
      .duration(750)
      .attr(
        'transform',
        `translate(${this.width / 2},${this.height / 2}) scale(1)`
      );

    // Hide or remove moon elements
    this.svg.selectAll('.moon-group').remove(); // or use .style('display', 'none') to hide
    this.svg.selectAll('.moon-orbit-group').remove(); // or use .style('display', 'none') to hide
  }

  private formatForID(name: string) {
    if (!name) return;
    return name.toLowerCase().replace(' ', '_');
  }

  /**
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   */

  /** multiple planets on their own orbit */
  planetAndTheirRespectiveOrbits(): void {
    // ... existing SVG initialization code

    // Define a scale for the orbits if necessary
    const orbitScale = d3
      .scaleLinear()
      .domain([0, this.planets.length])
      .range([50, this.mainOrbitRadius]); // Adjust the range based on your visualization

    this.planets.forEach((planet, index) => {
      // Draw orbits
      this.svg
        .append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', orbitScale(index))
        .style('fill', 'none')
        .style('stroke', 'gray');

      // Position the planet on its orbit
      // For simplicity, this example places each planet at a random point on its orbit
      const angle = Math.random() * 2 * Math.PI; // Random angle
      const x = orbitScale(index) * Math.cos(angle);
      const y = orbitScale(index) * Math.sin(angle);

      this.svg
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 10) // Adjust the radius as needed
        .style('fill', 'blue'); // Style the planet
    });
  }

  /** orbit with ROTATION */
  mainOrbitPlanetsWithRotation(): void {
    const fixedMainOrbitRadius = 300; // Set the fixed radius for the orbit
    const orbitDuration = 5000000; // Duration of one orbit in milliseconds

    // Draw the fixed orbit
    this.svg
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', fixedMainOrbitRadius)
      .style('fill', 'none')
      .style('stroke', 'gray');

    this.planets.forEach((planet, index) => {
      // Create a group for each planet
      const planetGroup = this.svg.append('g');

      // Initial angle
      const initialAngle = ((2 * Math.PI) / this.planets.length) * index;

      // Function to update planet position
      const updatePosition = (angle: any) => {
        const x = fixedMainOrbitRadius * Math.cos(angle);
        const y = fixedMainOrbitRadius * Math.sin(angle);
        planetGroup.attr('transform', `translate(${x}, ${y})`);
      };

      // Set initial position
      updatePosition(initialAngle);

      // Draw the planet
      planetGroup
        .append('circle')
        .attr('r', 10) // Adjust the radius as needed
        .style('fill', 'blue'); // Style the planet

      // Animate the orbit
      const animateOrbit = () => {
        planetGroup
          .transition()
          .duration(orbitDuration)
          .ease(d3.easeLinear)
          .attrTween('transform', () => {
            const interpolate = d3.interpolate(0, 2 * Math.PI);
            return (t: any) =>
              `translate(${fixedMainOrbitRadius * Math.cos(interpolate(t))}, ${
                fixedMainOrbitRadius * Math.sin(interpolate(t))
              })`;
          })
          .on('end', animateOrbit); // Loop the animation
      };

      animateOrbit();
    });
  }

  /** This has a planet with a natural orbit around a point */
  planetOrbitingAround(): void {
    // ... existing SVG initialization code

    // Function to calculate position on orbit
    const getPosition = (mainOrbitRadius: any, angle: any) => ({
      x: mainOrbitRadius * Math.cos(angle),
      y: mainOrbitRadius * Math.sin(angle),
    });

    this.planets.forEach((planet) => {
      // Initial angle
      const initialAngle = Math.random() * 2 * Math.PI;

      // Initial position
      const initialPos = getPosition(100, initialAngle);

      // Draw the planet
      const planetElement = this.svg
        .append('circle')
        .attr('cx', initialPos.x)
        .attr('cy', initialPos.y)
        .attr('r', 10) // Adjust radius as needed
        .style('fill', 'blue');

      // Animate the orbit
      const animateOrbit = () => {
        planetElement
          .transition()
          .duration(5000) // Adjust duration for orbit speed
          .attrTween('transform', () => {
            let i = d3.interpolate(10, 1 * Math.PI);
            return (t: any) => {
              let pos = getPosition(100, i(t));
              return `translate(${pos.x}, ${pos.y})`;
            };
          })
          .on('end', animateOrbit); // Loop the animation
      };

      animateOrbit();
    });
  }

  /**
   *
   *
   *
   *
   */

  updateCircle(): void {
    this.mainOrbit
      .attr('r', this.mainOrbitRadius)
      .style(
        'stroke-dasharray',
        `${this.dashArrayValue1},${this.dashArrayValue2}`
      );

    this.mainOrbitPlanets();
  }

  addPlanetToState() {
    this.store.dispatch(
      new KnowledgeGraphAddPlanet({
        name: 'earth2',
        moons: [
          {
            name: 'moon',
            satellites: [
              {
                name: 'mini moon',
              },
            ],
          },
        ],
      })
    );
  }

  /**
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   *
   */
  /* resize is not working */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateSvgSize();
  }

  updateSvgSize(): void {
    const element = this.container.nativeElement;
    const newWidth = element.offsetWidth;
    const newHeight = element.offsetHeight;

    this.coreSVG.attr('width', newWidth).attr('height', newHeight);

    this.svg.attr('transform', `translate(${newWidth / 2},${newHeight / 2})`);

    this.mainOrbit
      .attr('r', this.mainOrbitRadius)
      .style(
        'stroke-dasharray',
        `${this.dashArrayValue1},${this.dashArrayValue2}`
      );

    this.mainOrbitPlanets();
  }
}
