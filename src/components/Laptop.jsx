import { useRef, useMemo } from 'react'
import { Box, Decal, Cylinder } from '@react-three/drei'
import * as THREE from 'three'

export function Laptop() {
    // Brighter materials for better visibility
    const matProps = {
        roughness: 0.15,
        metalness: 0.8,
        color: "#444"
    }

    return (
        <group dispose={null}>
            {/* Main Chassis (Based on Sketch) */}
            <Box args={[4.2, 0.1, 2.8]} position={[0, -0.05, 0]}>
                <meshStandardMaterial {...matProps} />
            </Box>

            {/* Vent Grid (The Application Target) */}
            <group position={[0, 0.005, 0]}>
                {/* 8-Column Grid like sketch */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <Box key={i} args={[0.08, 0.015, 2.2]} position={[(i * 0.45) - 1.575, 0, 0]}>
                        <meshStandardMaterial color="#111" metalness={1} roughness={0.2} />
                    </Box>
                ))}
            </group>

            {/* Left Side Labels / Regulatory Text Area */}
            <group position={[-1.4, 0, 0]}>
                <Box args={[0.8, 0.01, 2.2]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#080808" />
                </Box>
                {/* Tiny simulated text lines */}
                {Array.from({ length: 14 }).map((_, i) => (
                    <Box key={i} args={[0.6, 0.001, 0.01]} position={[0, 0.01, (i * 0.12) - 0.5]}>
                        <meshBasicMaterial color="#333" />
                    </Box>
                ))}
            </group>

            {/* Ports on the Right Side */}
            <group position={[2.11, 0, 0.2]}>
                <Box args={[0.01, 0.05, 0.2]} position={[0, -0.01, -0.4]}>
                    <meshStandardMaterial color="#000" metalness={1} />
                </Box>
                <Box args={[0.01, 0.03, 0.03]} position={[0, -0.01, 0.1]}>
                    <meshStandardMaterial color="#000" metalness={1} />
                </Box>
            </group>

            {/* Lid with simulated stickers */}
            <Box args={[4.2, 0.04, 2.8]} position={[0, 0.1, 0]}>
                <meshStandardMaterial color="#222" roughness={0.2} metalness={0.9} />
                <group position={[0, 0.021, 0]}>
                    <Box args={[1.2, 0.001, 0.6]} position={[-1, 0, 0.5]} rotation={[0, 0.2, 0]}>
                        <meshStandardMaterial color="#eeeeee" />
                    </Box>
                    <Box args={[0.8, 0.001, 0.8]} position={[0.8, 0, -0.4]} rotation={[0, -0.3, 0]}>
                        <meshStandardMaterial color="#111111" />
                    </Box>
                </group>
            </Box>
        </group>
    )
}
