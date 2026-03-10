import { useRef, useLayoutEffect, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './components/Scene'
import { Loader } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Cpu, Wind, ShieldCheck, Activity, Terminal, Zap } from 'lucide-react'
import './index.css'

gsap.registerPlugin(ScrollTrigger)

// --- TechNode: Inspired by the interactive simulator repo ---
function TechNode({ icon: Icon, title, desc, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="tech-node"
      style={{
        display: 'flex',
        gap: '1.5rem',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderLeft: '2px solid var(--color-accent)',
        backdropFilter: 'blur(20px)',
        marginBottom: '1.5rem',
        maxWidth: '450px',
        border: '1px solid rgba(255,255,255,0.05)',
        borderLeftWidth: '3px'
      }}
    >
      <div style={{ color: 'var(--color-accent)' }}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <div>
        <h3 style={{
          fontFamily: 'var(--font-hud)',
          fontSize: '0.85rem',
          color: 'var(--color-accent)',
          marginBottom: '0.5rem',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.9rem', opacity: 0.6, lineHeight: 1.6, color: '#fff', fontWeight: '300' }}>
          {desc}
        </p>
      </div>
    </motion.div>
  )
}

// --- HUDElement: High-end tech overlay with flickering entrance ---
function HUDElement({ children, style }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.8, 1] }}
      transition={{ duration: 0.6, times: [0, 0.1, 0.2, 1] }}
      className="hud-ui"
      style={{ ...style, zIndex: 1000, pointerEvents: 'none' }}
    >
      {children}
    </motion.div>
  )
}

function MeshBuild({ children, triggerId, delay = 0, className = "" }) {
  const containerRef = useRef()
  const fillRef = useRef()

  useEffect(() => {
    if (!containerRef.current) return

    if (!document.querySelector(triggerId)) {
      console.warn(`MeshBuild: Trigger ${triggerId} not found, skipping.`);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(fillRef.current, { width: "0%" })
      gsap.to(fillRef.current, {
        width: "100%",
        duration: 2,
        ease: "power3.inOut",
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
        WebkitTextStroke: '1px rgba(255, 255, 255, 0.2)',
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
        borderRight: '2px solid var(--color-accent)'
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
  const [selectedWeight, setSelectedWeight] = useState('#111214')

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })
      tl.from(".hero-title-main", { y: 100, opacity: 0, duration: 2.5, skewY: 5 }, 0.5)
      tl.from(".hero-tagline", { opacity: 0, y: 20, duration: 1.5 }, 1.5)
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
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene scrollContainer={containerRef} selectedColor={selectedWeight} />
          </Suspense>
        </Canvas>
      </div>

      <div className="mesh-gradient"></div>
      <div className="cross-bg" style={{ opacity: 0.4 }}></div>
      <div className="grain-overlay" style={{ opacity: 0.05 }}></div>
      <div className="vignette-overlay"></div>

      <HUDElement style={{ top: '40px', left: '40px', textAlign: 'left' }}>
        <div style={{ color: 'var(--color-accent)', marginBottom: '4px', fontFamily: 'var(--font-hud)', fontSize: '0.7rem' }}>
          <Activity size={10} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          SYSTEM: ONLINE // V.2.1.0_PRO
        </div>
        <div style={{ color: 'var(--color-accent)', marginBottom: '4px', fontFamily: 'var(--font-hud)', fontSize: '0.7rem', opacity: 0.6 }}>
          LINK: SECURE_PROTOCOL_7
        </div>
        <div style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-hud)', fontSize: '0.7rem' }}>
          COORDS: [34.05, -118.24]
        </div>
      </HUDElement>

      <HUDElement style={{ bottom: '40px', right: '40px', textAlign: 'right' }}>
        <div style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-hud)', fontSize: '0.75rem', letterSpacing: '2px' }}>
          SCROLL_TO_INITIALIZE_HARDWARE
        </div>
      </HUDElement>

      <div ref={containerRef} className="ui-container" style={{ pointerEvents: 'auto' }}>
        <section className="section hero" id="sec-1">
          <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, letterSpacing: "20px" }}
              animate={{ opacity: 0.5, letterSpacing: "8px" }}
              transition={{ duration: 2, delay: 0.5 }}
              style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '0.7rem',
                marginBottom: '1.5rem',
                color: 'var(--color-accent)',
                textTransform: 'uppercase'
              }}
            >
              The Next Evolution of Thermal Management
            </motion.div>

            <h1 className="hero-title-main" style={{
              fontSize: 'min(15vw, 220px)',
              color: '#fff',
              fontWeight: '900',
              opacity: 1,
              fontFamily: 'var(--font-main)',
              lineHeight: 0.8,
              textShadow: '0 0 60px rgba(0, 191, 255, 0.3)'
            }}>
              FERROO <br /> TAPE
            </h1>

            <div className="hero-tagline" style={{ marginTop: '2rem', maxWidth: '400px', margin: '2rem auto 0' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', opacity: 0.4, fontStyle: 'italic', letterSpacing: '1px' }}>
                "Where physics meets high-performance hardware."
              </p>
            </div>
          </div>
        </section>

        <section className="section blueprint" id="sec-2" style={{ padding: '0 10vw' }}>
          <div className="section-content left-align">
            <h2 style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontStyle: 'italic',
              marginBottom: '5rem',
              lineHeight: 1.1
            }}>
              Precision <br />
              <span style={{ color: 'var(--color-accent)' }}>Architecture.</span>
            </h2>

            <div className="blueprint-nodes" style={{ position: 'relative' }}>
              <TechNode
                icon={Cpu}
                title="Nano-Conductive Silicon"
                desc="Graphene-enhanced adhesive matrix with zero thermal resistance for maximum heat dissipation."
                delay={0.2}
              />
              <TechNode
                icon={Wind}
                title="Laminar Airflow Geometry"
                desc="Optimized micro-ridges that channel air directly over hotspot zones, reducing turbulence by 22%."
                delay={0.4}
              />
              <TechNode
                icon={ShieldCheck}
                title="Ion-Grip Surface"
                desc="Molecular-level bonding that chemically fuses with laptop alloy surfaces under heat-activation."
                delay={0.6}
              />
            </div>
          </div>
        </section>

        <section className="section unroll" id="sec-3">
          <div className="section-content center-align">
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: 'clamp(4rem, 12vw, 15rem)', marginBottom: '3rem', fontStyle: 'italic' }}>
              <MeshBuild triggerId="#sec-3">Pure Velocity.</MeshBuild>
            </h2>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', opacity: 0.5, lineHeight: 1.8, fontWeight: '300' }}>
                Engineered for the elite. Ferroo Tape uses a patented unroll geometry that ensures zero bubbles and zero gap adhesion on every application.
              </p>
            </div>
          </div>
        </section>

        <section className="section apply" id="sec-5">
          <div className="section-content center-align" style={{ pointerEvents: 'auto' }}>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{ marginBottom: '4rem' }}
            >
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '1rem', fontFamily: 'var(--font-main)', letterSpacing: '-2px' }}>
                Hardware Customization
              </h2>
              <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--color-accent)', fontSize: '0.8rem', opacity: 0.7 }}>
                SELECT_SYSTEM_PROFILE_COLOR:
              </p>
            </motion.div>

            <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center' }}>
              {[
                { name: 'OBSIDIAN', color: '#111214' },
                { name: 'TITANIUM', color: '#1a1a1a' },
                { name: 'QUARTZ', color: '#ffffff' }
              ].map((variant) => (
                <div key={variant.name} style={{ textAlign: 'center' }} onClick={() => setSelectedWeight(variant.color)}>
                  <div
                    className={`color-swatch ${selectedWeight === variant.color ? 'active' : ''}`}
                    style={{ backgroundColor: variant.color, width: '60px', height: '60px', borderRadius: '50%', marginBottom: '1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}
                  ></div>
                  <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.65rem', letterSpacing: '1px' }}>{variant.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section final" id="sec-8">
          <div className="section-content center-align">
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.8rem', color: 'var(--color-accent)', marginBottom: '2rem', letterSpacing: '5px' }}>
              THE_END_OF_THROTTLING
            </div>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: 'clamp(5rem, 15vw, 20rem)', fontStyle: 'italic', letterSpacing: '-5px' }}>
              <MeshBuild triggerId="#sec-8">Mastery.</MeshBuild>
            </h2>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                marginTop: '4rem',
                padding: '1.5rem 4rem',
                background: '#fff',
                color: '#000',
                fontFamily: 'var(--font-hud)',
                fontSize: '1rem',
                fontWeight: '900',
                borderRadius: '100px',
                cursor: 'pointer',
                display: 'inline-block'
              }}
            >
              PRE-ORDER_2026
            </motion.div>
          </div>
        </section>
      </div>

      <Loader />
    </>
  )
}

export default App
