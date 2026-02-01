import { describe, it, expect } from 'bun:test';
import {
  parse_smiles,
  build_smiles,
  decompile_smiles,
  validate_roundtrip,
  get_common_fragments,
} from './index.js';

describe('parse_smiles', () => {
  it('parses benzene', () => {
    const result = parse_smiles({ smiles: 'c1ccccc1' });
    expect(result).toEqual({
      success: true,
      smiles: 'c1ccccc1',
      ast: {
        type: 'ring',
        atoms: 'c',
        size: 6,
        ringNumber: 1,
        offset: 0,
        substitutions: {},
        attachments: {},
        bonds: [null, null, null, null, null, null],
      },
    });
  });

  it('parses ethanol', () => {
    const result = parse_smiles({ smiles: 'CCO' });
    expect(result).toEqual({
      success: true,
      smiles: 'CCO',
      ast: {
        type: 'linear',
        atoms: ['C', 'C', 'O'],
        bonds: [null, null],
        attachments: {},
      },
    });
  });

  it('handles invalid SMILES', () => {
    const result = parse_smiles({ smiles: 'C1CC' }); // Unclosed ring
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unclosed');
  });
});

describe('build_smiles', () => {
  it('builds benzene from AST', () => {
    const ast = {
      type: 'ring',
      atoms: 'c',
      size: 6,
      ringNumber: 1,
      offset: 0,
      substitutions: {},
      attachments: {},
      bonds: [],
    };
    const result = build_smiles({ ast });
    expect(result.success).toBe(true);
    expect(result.smiles).toBe('c1ccccc1');
  });

  it('builds ethanol from AST', () => {
    const ast = {
      type: 'linear',
      atoms: ['C', 'C', 'O'],
      bonds: [],
      attachments: {},
    };
    const result = build_smiles({ ast });
    expect(result.success).toBe(true);
    expect(result.smiles).toBe('CCO');
  });
});

describe('decompile_smiles', () => {
  it('decompiles benzene', () => {
    const result = decompile_smiles({ smiles: 'c1ccccc1' });
    expect(result.success).toBe(true);
    expect(result.code).toContain('Ring');
    expect(result.code).toContain("atoms: 'c'");
    expect(result.code).toContain('size: 6');
  });

  it('decompiles linear chain', () => {
    const result = decompile_smiles({ smiles: 'CCCC' });
    expect(result.success).toBe(true);
    expect(result.code).toContain('Linear');
  });
});

describe('validate_roundtrip', () => {
  it('validates benzene', () => {
    const result = validate_roundtrip({ smiles: 'c1ccccc1' });
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('validates cyclohexane', () => {
    const result = validate_roundtrip({ smiles: 'C1CCCCC1' });
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('validates toluene', () => {
    const result = validate_roundtrip({ smiles: 'Cc1ccccc1' });
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
  });
});

describe('get_common_fragments', () => {
  it('returns fragments', () => {
    const result = get_common_fragments();
    expect(result.success).toBe(true);
    expect(result.fragments).toBeDefined();
    expect(result.categories).toBeDefined();
    expect(result.categories.alkyl).toContain('methyl');
    expect(result.categories.rings).toContain('benzene');
  });

  it('has correct benzene SMILES', () => {
    const result = get_common_fragments();
    expect(result.fragments.benzene.smiles).toBe('c1ccccc1');
  });
});
