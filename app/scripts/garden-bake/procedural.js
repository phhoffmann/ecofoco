// Hand-built blocky models for archetypes the CC0 kits don't cover, styled after Kenney's Cube Pets
// (boxes, flat colours, big eyes). Original work, CC0 like the rest of the garden art.

function box(THREE, group, [w, h, d], [x, y, z], color, name = 'body') {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color }))
  mesh.material.name = name
  mesh.position.set(x, y, z)
  group.add(mesh)
  return mesh
}

/** A tegu-like lizard facing +x: low body, wide head, tapering tail, splayed legs. */
function lizard(THREE, { body, belly, accent }) {
  const g = new THREE.Group()
  box(THREE, g, [0.56, 0.16, 0.26], [0, 0.13, 0], body)
  box(THREE, g, [0.5, 0.04, 0.22], [0, 0.05, 0], belly, 'belly')
  // Banding along the back.
  for (const x of [-0.16, 0, 0.16]) box(THREE, g, [0.06, 0.02, 0.24], [x, 0.215, 0], accent, 'accent')
  box(THREE, g, [0.24, 0.15, 0.24], [0.38, 0.15, 0], body)
  box(THREE, g, [0.1, 0.07, 0.18], [0.53, 0.12, 0], body)
  for (const z of [-0.1, 0.1]) {
    box(THREE, g, [0.06, 0.06, 0.03], [0.44, 0.2, z * 1.25], '#ffffff', 'eye')
    box(THREE, g, [0.035, 0.04, 0.02], [0.46, 0.2, z * 1.38], '#1d1d1d', 'pupil')
  }
  box(THREE, g, [0.22, 0.11, 0.16], [-0.38, 0.11, 0], body)
  box(THREE, g, [0.2, 0.08, 0.11], [-0.58, 0.08, 0.02], body)
  box(THREE, g, [0.18, 0.05, 0.07], [-0.76, 0.05, 0.05], accent, 'accent')
  for (const [x, z] of [
    [0.18, 0.17],
    [0.18, -0.17],
    [-0.18, 0.17],
    [-0.18, -0.17],
  ]) {
    box(THREE, g, [0.08, 0.1, 0.1], [x, 0.05, z], body)
    box(THREE, g, [0.11, 0.025, 0.08], [x + 0.03, 0.0125, z * 1.15], accent, 'accent')
  }
  return g
}

/** A two-leaf seedling on a small soil mound: the first growth stage of every plant. */
function seedling(THREE, { soil, stem, leaf }) {
  const g = new THREE.Group()
  box(THREE, g, [0.34, 0.06, 0.34], [0, 0.03, 0], soil, 'soil')
  box(THREE, g, [0.22, 0.05, 0.22], [0, 0.08, 0], soil, 'soil')
  box(THREE, g, [0.035, 0.24, 0.035], [0, 0.22, 0], stem, 'stem')
  for (const side of [-1, 1]) {
    const blade = box(THREE, g, [0.2, 0.03, 0.11], [side * 0.1, 0.35, 0], leaf, 'leaf')
    blade.rotation.z = side * 0.45
  }
  return g
}

const BUILDERS = { lizard, seedling }

export function buildProcedural(THREE, { kind, colors }) {
  return BUILDERS[kind](THREE, colors)
}
