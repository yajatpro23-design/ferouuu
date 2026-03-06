import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Cubes(props) {
    const meshRef = useRef()
    const edgesRef = useRef()

    // 4x4 grid
    const gridCount = 4
    const count = gridCount * gridCount
    const spacing = 1.1

    // Prepare dummy objects for instancing
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const color = useMemo(() => new THREE.Color(), [])

    useEffect(() => {
        let i = 0
        for (let x = 0; x < gridCount; x++) {
            for (let z = 0; z < gridCount; z++) {
                // Calculate position based on grid index
                const posX = (x - gridCount / 2 + 0.5) * spacing
                const posZ = (z - gridCount / 2 + 0.5) * spacing

                // Calculate color gradient based on local position
                // Top Left: Cyan, Bottom Right: Magenta
                // Map x and z to 0-1
                const u = x / (gridCount - 1)
                const v = z / (gridCount - 1)

                // Mix colors
                // from Cyan(0,1,1) to Magenta(1,0,1)
                const r = u
                const g = 1.0 - u
                const b = 1.0
                color.setRGB(r, g, b)

                if (edgesRef.current) {
                    edgesRef.current.setColorAt(i, color)
                }
                i++
            }
        }
        if (edgesRef.current) {
            edgesRef.current.instanceColor.needsUpdate = true
        }
    }, [gridCount, spacing, count])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        let i = 0
        for (let x = 0; x < gridCount; x++) {
            for (let z = 0; z < gridCount; z++) {
                // Calculate position based on grid index
                const posX = (x - gridCount / 2 + 0.5) * spacing
                const posZ = (z - gridCount / 2 + 0.5) * spacing

                // Calculate wave height (sinusoidal)
                const distance = Math.sqrt(posX * posX + posZ * posZ)
                const posY = Math.sin(distance * 1.5 - time * 2) * 0.4

                dummy.position.set(posX, posY, posZ)
                dummy.updateMatrix()

                if (meshRef.current) {
                    meshRef.current.setMatrixAt(i, dummy.matrix)
                }
                if (edgesRef.current) {
                    edgesRef.current.setMatrixAt(i, dummy.matrix)
                }
                i++
            }
        }

        if (meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true
        if (edgesRef.current) edgesRef.current.instanceMatrix.needsUpdate = true
    })

    // We want the cubes slightly rotated to have that isometric look natively
    return (
        <group {...props} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
            {/* Solid Black inner cubes to hide edges from behind */}
            <instancedMesh ref={meshRef} args={[null, null, count]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#000000" />
            </instancedMesh>

            {/* Glowing Edges */}
            <instancedMesh ref={edgesRef} args={[null, null, count]}>
                <boxGeometry args={[1.02, 1.02, 1.02]} />
                <meshBasicMaterial
                    wireframe={true}
                    transparent={true}
                    opacity={0.9}
                />
            </instancedMesh>
        </group>
    )
}
