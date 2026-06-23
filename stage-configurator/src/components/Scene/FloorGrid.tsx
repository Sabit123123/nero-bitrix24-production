'use client';
import { Grid } from '@react-three/drei';

export function FloorGrid() {
  return (
    <Grid
      args={[100, 100]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#333322"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#554433"
      fadeDistance={50}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={true}
    />
  );
}
