/**
 * SMILES Skill - Tool implementations
 */

import {
  parse,
  buildSMILES,
  decompile,
  isValidRoundTrip,
  Ring,
  Linear,
  FusedRing,
  Molecule,
} from 'smiles-js';

import * as common from 'smiles-js/common';

/**
 * Convert an AST node to a plain object for JSON serialization
 */
function astToObject(node) {
  if (!node || typeof node !== 'object') {
    return node;
  }

  if (node.toObject) {
    return node.toObject();
  }

  // Handle arrays
  if (Array.isArray(node)) {
    return node.map(astToObject);
  }

  // Handle plain objects
  const result = {};
  for (const [key, value] of Object.entries(node)) {
    // Skip private/internal properties
    if (key.startsWith('_')) continue;
    // Skip functions
    if (typeof value === 'function') continue;
    result[key] = astToObject(value);
  }
  return result;
}

/**
 * Reconstruct an AST node from a plain object
 */
function objectToAst(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const { type } = obj;

  if (type === 'ring') {
    const ring = Ring({
      atoms: obj.atoms,
      size: obj.size,
      ringNumber: obj.ringNumber || 1,
      offset: obj.offset || 0,
      substitutions: obj.substitutions || {},
      attachments: reconstructAttachments(obj.attachments),
      bonds: obj.bonds || [],
    });
    return ring;
  }

  if (type === 'linear') {
    return Linear(
      obj.atoms || [],
      obj.bonds || [],
      reconstructAttachments(obj.attachments)
    );
  }

  if (type === 'fused_ring') {
    const rings = (obj.rings || []).map(objectToAst);
    return FusedRing(rings);
  }

  if (type === 'molecule') {
    const components = (obj.components || []).map(objectToAst);
    return Molecule(components);
  }

  return obj;
}

/**
 * Reconstruct attachments from plain object
 */
function reconstructAttachments(attachments) {
  if (!attachments) return {};

  const result = {};
  for (const [pos, list] of Object.entries(attachments)) {
    result[pos] = list.map(objectToAst);
  }
  return result;
}

/**
 * Parse a SMILES string into an AST
 */
export function parse_smiles({ smiles }) {
  try {
    const ast = parse(smiles);
    const astObject = astToObject(ast);

    return {
      success: true,
      smiles,
      ast: astObject,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Build a SMILES string from an AST object
 */
export function build_smiles({ ast }) {
  try {
    const node = objectToAst(ast);
    const smiles = buildSMILES(node);

    return {
      success: true,
      smiles,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Decompile a SMILES string to JavaScript constructor code
 */
export function decompile_smiles({ smiles }) {
  try {
    const ast = parse(smiles);
    const code = decompile(ast);

    return {
      success: true,
      smiles,
      code,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Validate SMILES round-trip fidelity
 */
export function validate_roundtrip({ smiles }) {
  try {
    const isValid = isValidRoundTrip(smiles);

    if (isValid) {
      return {
        success: true,
        smiles,
        valid: true,
        message: 'SMILES round-trip validation passed',
      };
    }

    // Get more details on the mismatch
    const ast = parse(smiles);
    const regenerated = buildSMILES(ast);

    return {
      success: true,
      smiles,
      valid: false,
      regenerated,
      message: `Round-trip mismatch: expected "${smiles}", got "${regenerated}"`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get common molecular fragments
 */
export function get_common_fragments() {
  const fragments = {};

  // Extract SMILES from each common fragment
  for (const [name, fragment] of Object.entries(common)) {
    try {
      if (fragment && typeof fragment === 'object' && fragment.smiles !== undefined) {
        fragments[name] = {
          smiles: fragment.smiles,
          type: fragment.type,
        };
      }
    } catch (e) {
      // Skip fragments that can't be serialized
    }
  }

  return {
    success: true,
    fragments,
    categories: {
      alkyl: ['methyl', 'ethyl', 'propyl', 'isopropyl', 'butyl', 'tertButyl'],
      functional: ['hydroxyl', 'amino', 'carboxyl', 'carbonyl', 'ester', 'ether', 'aldehyde', 'ketone'],
      aromatic: ['phenyl', 'benzyl'],
      rings: ['benzene', 'cyclohexane', 'cyclopentane', 'pyridine', 'furan', 'pyrrole', 'imidazole'],
      halides: ['fluoro', 'chloro', 'bromo', 'iodo'],
      other: ['nitro', 'cyano', 'sulfhydryl', 'sulfonyl', 'phosphate'],
    },
  };
}

// Expose all tools
export const tools = {
  parse_smiles,
  build_smiles,
  decompile_smiles,
  validate_roundtrip,
  get_common_fragments,
};
