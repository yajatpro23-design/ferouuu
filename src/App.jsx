import { useRef, useLayoutEffect, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import { Loader } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'

gsap.registerPlugin(ScrollTrigger)

function MeshBuild({ children, triggerId, delay = 0, className = "" }) {
  const containerRef = useRef()
  const fillRef = useRef()

  useEffect(() => {
    if (!containerRef.current) return

    // Safety: ensure trigger exists in DOM
    if (!document.querySelector(triggerId)) {
      console.warn(`MeshBuild: Trigger ${triggerId} not found, skipping.`);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(fillRef.current, { width: "0%" })
      gsap.to(fillRef.current, {
        width: "100%",
        duration: 1.5,
        ease: "power2.inOut",
        delay: delay,
        scrollTrigger: {
          trigger: triggerId,
          start: "top 85%",
          toggleActions: "play reverse play reverse",
        }
      })
    }, containerRef.current)
    return () => ctx.revert()
  }, [triggerId, delay])

  return (
    <div ref={containerRef} className={`mesh-build-container ${className}`} style={{ position: 'relative', display: 'inline-block' }}>
      <span className="mesh-outline" style={{
        WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)',
        color: 'transparent',
        position: 'relative',
        zIndex: 1
      }}>
        {children}
      </span>
      <div ref={fillRef} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        zIndex: 2,
        borderRight: '2px solid #ffffff'
      }}>
        <span style={{ color: '#fff' }}>
          {children}
        </span>
      </div>
    </div>
  )
}

function App() {
  const containerRef = useRef(null)
  const cursorRef = useRef(null)
  const [selectedWeight, setSelectedWeight] = useState('#111214')

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power2.out"
        })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })
      tl.from(".hero-title-main", { y: 60, opacity: 0, duration: 2 }, 0.5)
      tl.from(".hud-ui", { opacity: 0, stagger: 0.1, duration: 2 }, 1.5)
    })
    return () => ctx.revert()
  }, [])

  return (
    <>
      <div className="canvas-container">
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 35 }}
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={() => { }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene scrollContainer={containerRef} selectedColor={selectedWeight} />
          </Suspense>
        </Canvas>
      </div>

      <div ref={cursorRef} className="custom-cursor"></div>
      <div className="mesh-gradient"></div>
      <div className="cross-bg"></div>
      <div className="grain-overlay"></div>
      <div className="vignette-overlay"></div>

      <div className="hud-ui" style={{ top: '40px', left: '40px', textAlign: 'left', zIndex: 1000 }}>
        <div style={{ color: 'var(--color-accent)', marginBottom: '2px' }}>SYSTEM: ONLINE</div>
        <div style={{ color: 'var(--color-accent)', marginBottom: '2px' }}>V.2.0.4</div>
        <div style={{ color: 'var(--color-accent)' }}>FERRO_CORE_ACTIVE</div>
      </div>

      <div className="hud-ui" style={{ bottom: '40px', right: '40px', textAlign: 'right', zIndex: 1000 }}>
        <div style={{ color: 'var(--color-accent)' }}>SCROLL_DETECTED</div>
      </div>

      <div ref={containerRef} className="ui-container" style={{ pointerEvents: 'auto' }}>
        <section className="section hero" id="sec-1">
          <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
            <h1 className="hero-title-main" style={{
              fontSize: '15vw',
              color: '#fff',
              fontWeight: '900',
              opacity: 1,
              textShadow: '0 0 40px rgba(255,255,255,0.2)'
            }}>
              FERROO TAPE
            </h1>
          </div>
        </section>

        <section className="section macro" id="sec-2">
          <div className="section-content left-align">
            <h2><MeshBuild triggerId="#sec-2">MATTE MESH FIBER</MeshBuild></h2>
          </div>
        </section>

        <section className="section unroll" id="sec-3">
          <div className="section-content center-align">
            <h2><MeshBuild triggerId="#sec-3">NANOWEAVE CORE</MeshBuild></h2>
          </div>
        </section>

        <section className="section apply" id="sec-5">
          <div className="section-content center-align" style={{ pointerEvents: 'auto' }}>
            <h2 style={{ fontSize: '4rem', marginBottom: '3rem' }}>
              <MeshBuild triggerId="#sec-5">COLOR PALETTE</MeshBuild>
            </h2>
            <div style={{ display: 'flex', gap: '4rem' }}>
              {[
                { name: 'MATTE BLACK', color: '#111214' },
                { name: 'SPACE GREY', color: '#1a1a1a' },
                { name: 'SILVER', color: '#ffffff' }
              ].map((variant) => (
                <div key={variant.name} style={{ textAlign: 'center' }} onClick={() => setSelectedWeight(variant.color)}>
                  <div
                    className={`color-swatch ${selectedWeight === variant.color ? 'active' : ''}`}
                    style={{ backgroundColor: variant.color }}
                  ></div>
                  <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.7rem' }}>{variant.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section final" id="sec-8">
          <div className="section-content center-align">
            <h2><MeshBuild triggerId="#sec-8">GAME SMARTER.</MeshBuild></h2>
          </div>
        </section>
      </div>

      <Loader />
    </>
  )
}

export default App
