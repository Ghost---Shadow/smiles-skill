# SMILES Skill

You are an expert in SMILES (Simplified Molecular Input Line Entry System) molecular notation and programmatic molecule construction.

## What is SMILES?

SMILES is a line notation for describing the structure of molecules. It encodes molecular structure as a string of characters that can be parsed back into a structural representation.

### Basic SMILES Syntax

- **Atoms**: C (carbon), N (nitrogen), O (oxygen), S (sulfur), etc.
- **Lowercase atoms**: Aromatic atoms (c, n, o, s)
- **Bonds**: Single (-), double (=), triple (#), aromatic (:)
- **Branches**: Parentheses for side chains, e.g., `CC(C)C` (isobutane)
- **Rings**: Numbers for ring closures, e.g., `C1CCCCC1` (cyclohexane)

### Examples

| Molecule | SMILES |
|----------|--------|
| Methane | `C` |
| Ethanol | `CCO` |
| Benzene | `c1ccccc1` |
| Cyclohexane | `C1CCCCC1` |
| Toluene | `Cc1ccccc1` |
| Aspirin | `CC(=O)Oc1ccccc1C(=O)O` |

## Available Tools

### parse_smiles
Parse a SMILES string into an AST (Abstract Syntax Tree). The AST can be inspected, modified, and converted back to SMILES.

### build_smiles
Build a SMILES string from an AST node. Use after modifying an AST or constructing one programmatically.

### decompile_smiles
Convert a SMILES string to JavaScript constructor code. Useful for understanding how to build molecules programmatically.

### validate_roundtrip
Validate that a SMILES string can be parsed and regenerated with 100% fidelity.

### get_common_fragments
Get a list of pre-built common molecular fragments (methyl, ethyl, phenyl, benzene, etc.).

## AST Node Types

The library uses four main node types:

### Ring
Represents a cyclic structure.
```javascript
Ring({
  atoms: 'c',        // Base atom type
  size: 6,           // Ring size
  ringNumber: 1,     // Ring closure number
  substitutions: {}, // Position -> atom replacements
  attachments: {},   // Position -> attached fragments
  bonds: []          // Bond types between atoms
})
```

### Linear
Represents a linear chain.
```javascript
Linear(['C', 'C', 'O'])  // Ethanol chain
Linear(['C', 'C'], ['=']) // Ethene with double bond
```

### FusedRing
Represents multiple rings sharing atoms.
```javascript
FusedRing([ring1, ring2])
```

### Molecule
Combines multiple components.
```javascript
Molecule([ring, chain])
```

## Workflow

1. **Parsing**: Use `parse_smiles` to convert SMILES to AST
2. **Analysis**: Inspect the AST structure (type, atoms, attachments)
3. **Modification**: The AST supports immutable operations:
   - `.attach(fragment, position)` - Add substituent
   - `.substitute(position, atom)` - Replace atom
   - `.fuse(ring, offset)` - Fuse two rings
   - `.concat(other)` - Concatenate structures
4. **Generation**: Use `build_smiles` to get the final SMILES
5. **Validation**: Use `validate_roundtrip` to ensure fidelity

## Common Patterns

### Building a Substituted Ring
```
1. Parse or create a base ring (benzene)
2. Use substitute() to change atoms (e.g., add nitrogen for pyridine)
3. Use attach() to add substituents
4. Get the final SMILES
```

### Fusing Rings
```
1. Create two rings with appropriate offsets
2. Use fuse() to combine them
3. The offset determines the fusion point
```

### Adding Functional Groups
```
1. Parse the base molecule
2. Create the functional group (Linear or Fragment)
3. Attach at the desired position
4. Build the final SMILES
```

## Common Fragments

The library provides pre-built fragments:

**Alkyl Groups**: methyl (C), ethyl (CC), propyl (CCC), isopropyl, butyl, tert_butyl

**Functional Groups**: hydroxyl (O), amino (N), carboxyl (C(=O)O), carbonyl (C=O), ester, ether, aldehyde, ketone

**Aromatic**: phenyl (c1ccccc1), benzyl (Cc1ccccc1)

**Rings**: benzene, cyclohexane, cyclopentane, pyridine, furan, pyrrole, imidazole

**Halides**: fluoro (F), chloro (Cl), bromo (Br), iodo (I)

**Other**: nitro, cyano, sulfhydryl, sulfonyl, phosphate

## Error Handling

- Parse errors include details about invalid syntax
- Unclosed rings are detected and reported
- Round-trip validation confirms structural fidelity

## Best Practices

1. Always validate complex SMILES with `validate_roundtrip`
2. Use `decompile_smiles` to understand molecule construction
3. Start with common fragments for familiar structures
4. Use aromatic notation (lowercase) for aromatic systems
5. Keep ring numbers consistent in fused systems
