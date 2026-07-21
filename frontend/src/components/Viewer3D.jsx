import React from "react"
import { Canvas } from '@react-three/fiber'
import { OrbitControls,Grid } from '@react-three/drei'      
      
      
function Viewer3D() {
    return (     
      <Canvas camera={{ position: [3,3,3], fov: 75 }}>

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#4ade80" />
        </mesh>

        <Grid
            position={[0, 0, 0]}
            args={[10, 10]} //Tamanho da grade
            cellSize={1}
            cellThickness={1} //Espessura da linha
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThinckness={1.5}
            sectionColor="#aa3bff"
            fadeDistance={30}
        />



        <OrbitControls makeDefault />


      </Canvas>
    )
}

export default Viewer3D