from pathlib import Path

p = Path("src/components/AdminMembersPanel.jsx")
s = p.read_text(encoding="utf-8")

old = """                  </div>
                )}

            ) : (
              <>
                <h3 style={{ marginBottom: '10px' }}>{text.communicationHistory}</h3>"""

new = """                  </div>
                )}
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: '10px' }}>{text.communicationHistory}</h3>"""

if old not in s:
    raise SystemExit(
        "FIX FAILED: expected Phase 4A malformed section not found. "
        "Please send src/components/AdminMembersPanel.jsx."
    )

s = s.replace(old, new, 1)
p.write_text(s, encoding="utf-8")
print("✓ Fixed missing donation fragment close in AdminMembersPanel.jsx")
