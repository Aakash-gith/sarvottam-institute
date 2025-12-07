import re

# Read the file
with open(r'c:\Users\hp\Desktop\Projects\Sarvottam\sarvottam-institiute\grade10\notes\Chemistry\Chapter-4-Carbon.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace green colors with blue
replacements = [
    ('#22c55e', '#3b82f6'),
    ('rgba(34, 197, 94', 'rgba(59, 130, 246'),
    ('rgba(34,197,94', 'rgba(59,130,246'),
    ('#16a34a', '#2563eb'),
    ('#bbf7d0', '#93c5fd'),
    ('#022c22', '#0c1e3d'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write back
with open(r'c:\Users\hp\Desktop\Projects\Sarvottam\sarvottam-institiute\grade10\notes\Chemistry\Chapter-4-Carbon.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Colors updated from green to blue successfully!")
