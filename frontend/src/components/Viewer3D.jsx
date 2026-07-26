import React, { Suspense, useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'

// 1. O Controlador de Câmera (Voa suave até a posição e rotação desejada)
function CameraController({ targetView, setTargetView, controlsRef }) {
  const { camera } = useThree()

  useFrame(() => {
    if (!targetView) return

    const targetPos = new THREE.Vector3(...targetView.position)
    const targetLook = new THREE.Vector3(...targetView.lookAt)

    // Interpolação linear (lerp) para mover a câmera suavemente
    camera.position.lerp(targetPos, 0.06)

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook, 0.06)
      controlsRef.current.update()
    }

    if (camera.position.distanceTo(targetPos) < 0.05) {
      setTargetView(null) // Libera o controle do mouse do usuário
    }
  })

  return null
}

function ArchitectureModel({ setListaCenas }) {
  const gltf = useGLTF('/models/projeto_teste.glb')
  
  useEffect(() => {
    if (gltf.cameras && gltf.cameras.length > 0) {
      const cenasExtraidas = gltf.cameras.map((cam, index) => {
        // Captura a posição da câmera no espaço 3D
        const pos = [cam.position.x, cam.position.y, cam.position.z]
        
        // Descobre para onde a câmera está olhando
        const look = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).add(cam.position)
        
        return {
          id: `cam-${index}`,
          nome: cam.name || `Vista ${index + 1}`,
          position: pos,
          lookAt: [look.x, look.y, look.z]
        }
      })
      setListaCenas(cenasExtraidas)
    }
  }, [gltf, setListaCenas])

  return (
    <Center bottom>
      <primitive object={gltf.scene} />
    </Center>
  )
}

// 3. Componente Principal (Dashboard)
export default function Viewer3D() {
  const controlsRef = useRef()
  const [activeView, setActiveView] = useState(null)
  
  const [cenasDoProjeto, setListaCenas] = useState([
    { id: 'geral', nome: '01. Visão Geral (Padrão)', position: [12, 10, 12], lookAt: [0, 1, 0] },
    { id: 'fachada', nome: '02. Fachada Principal', position: [0, 2, 10], lookAt: [0, 1.5, 0] },
  ])

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#111', fontFamily: 'sans-serif', color: '#fff' }}>
      
      {/* BARRA LATERAL */}
      <div style={{ width: '320px', backgroundColor: '#18181c', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', borderRight: '1px solid #2c2c35', zIndex: 10 }}>
        <div>
          <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 600, color: '#aa3bff' }}>AEC Project Viewer</h2>
          <p style={{ fontSize: '12px', color: '#767680', marginTop: '4px' }}>TCC - Gestão de Projetos Arquitetônicos</p>
        </div>

        <hr style={{ border: 'none', height: '1px', backgroundColor: '#2c2c35', margin: '0' }} />

        <div>
          <h3 style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '12px', fontWeight: 500 }}>Cenas Identificadas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cenasDoProjeto.map((cena) => (
              <button
                key={cena.id}
                onClick={() => setActiveView(cena)}
                style={{
                  padding: '12px',
                  backgroundColor: '#222227',
                  color: '#e4e4e7',
                  border: '1px solid #2c2c35',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: '500',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.borderColor = '#aa3bff'}
                onMouseLeave={(e) => e.target.style.borderColor = '#2c2c35'}
              >
                {cena.nome}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ÁREA DO CANVAS 3D */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [12, 10, 12], fov: 45 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} />

          <Suspense fallback={null}>
            <ArchitectureModel setListaCenas={setListaCenas} />
          </Suspense>

          <CameraController 
            targetView={activeView} 
            setTargetView={setActiveView} 
            controlsRef={controlsRef} 
          />

          <Grid
            position={[0, -0.01, 0]} 
            args={[30, 30]} 
            cellSize={1}
            cellThickness={0.5}
            cellColor="#333"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#aa3bff"
            fadeDistance={30}
          />

          <OrbitControls ref={controlsRef} makeDefault minDistance={2} maxDistance={50} />
        </Canvas>
      </div>
    </div>
  )
}