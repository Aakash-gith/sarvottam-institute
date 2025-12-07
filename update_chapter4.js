const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'grade10', 'notes', 'Chemistry', 'Chapter-4-Carbon.html');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace green colors with blue
const replacements = [
    [/#22c55e/g, '#3b82f6'],
    [/rgba\(34, 197, 94/g, 'rgba(59, 130, 246'],
    [/rgba\(34,197,94/g, 'rgba(59,130,246'],
    [/#16a34a/g, '#2563eb'],
    [/#bbf7d0/g, '#93c5fd'],
    [/#022c22/g, '#0c1e3d'],
];

replacements.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
});

// Add nomenclature section after the "Naming carbon compounds" card
const nomenclatureAddition = `
    <details class="card">
      <summary>
        Detailed nomenclature examples
        <span class="summary-pill">IUPAC Practice</span>
        <span class="chevron">▶</span>
      </summary>
      <div class="card-content">
        <p><strong>Step-by-step nomenclature examples:</strong></p>
        
        <p style="margin-top:0.6rem;"><strong>Example 1: CH₃CH₂CH₂OH</strong></p>
        <ol style="padding-left:1.2rem; font-size:0.88rem;">
          <li>Longest chain: 3 carbons → <strong>prop</strong></li>
          <li>All single bonds → <strong>-an</strong></li>
          <li>Functional group: –OH → <strong>-ol</strong></li>
          <li>Drop 'e' before vowel → propan + ol = <strong>Propanol</strong> ✓</li>
        </ol>

        <p style="margin-top:0.6rem;"><strong>Example 2: CH₃COCH₃</strong></p>
        <ol style="padding-left:1.2rem; font-size:0.88rem;">
          <li>Longest chain: 3 carbons → <strong>prop</strong></li>
          <li>All single bonds in chain → <strong>-an</strong></li>
          <li>Functional group: &gt;C=O (ketone) → <strong>-one</strong></li>
          <li>Drop 'e' → propan + one = <strong>Propanone</strong> ✓</li>
        </ol>

        <p style="margin-top:0.6rem;"><strong>Example 3: CH₃CH₂COOH</strong></p>
        <ol style="padding-left:1.2rem; font-size:0.88rem;">
          <li>Longest chain: 3 carbons → <strong>prop</strong></li>
          <li>All single bonds → <strong>-an</strong></li>
          <li>Functional group: –COOH → <strong>-oic acid</strong></li>
          <li>Drop 'e' → propan + oic acid = <strong>Propanoic acid</strong> ✓</li>
        </ol>

        <p style="margin-top:0.6rem;"><strong>Example 4: CH₂=CH₂</strong></p>
        <ol style="padding-left:1.2rem; font-size:0.88rem;">
          <li>Longest chain: 2 carbons → <strong>eth</strong></li>
          <li>Double bond present → <strong>-ene</strong></li>
          <li>Result: <strong>Ethene</strong> ✓</li>
        </ol>

        <p style="margin-top:0.6rem;"><strong>Example 5: CH₃CHO</strong></p>
        <ol style="padding-left:1.2rem; font-size:0.88rem;">
          <li>Longest chain: 2 carbons → <strong>eth</strong></li>
          <li>All single bonds in chain → <strong>-an</strong></li>
          <li>Functional group: –CHO (aldehyde) → <strong>-al</strong></li>
          <li>Drop 'e' → ethan + al = <strong>Ethanal</strong> ✓</li>
        </ol>

        <p style="margin-top:0.6rem;"><strong>Example 6: CH₃CH₂Cl</strong></p>
        <ol style="padding-left:1.2rem; font-size:0.88rem;">
          <li>Longest chain: 2 carbons → <strong>eth</strong></li>
          <li>All single bonds → <strong>-ane</strong></li>
          <li>Substituent: Cl → <strong>chloro-</strong> prefix</li>
          <li>Result: <strong>Chloroethane</strong> ✓</li>
        </ol>

        <div class="pill-row">
          <div class="pill">Alkanes: -ane</div>
          <div class="pill">Alkenes: -ene</div>
          <div class="pill">Alkynes: -yne</div>
          <div class="pill">Alcohols: -ol</div>
          <div class="pill">Aldehydes: -al</div>
          <div class="pill">Ketones: -one</div>
          <div class="pill">Acids: -oic acid</div>
        </div>

        <div class="try-box">
          <div class="try-title">Practice</div>
          <p>Try naming: CH₃CH₂CH₂COOH → ?<br>
             Answer: Butanoic acid (4 carbons + -oic acid)</p>
        </div>
      </div>
    </details>`;

// Find the position to insert (after the "Naming carbon compounds (IUPAC basics)" card)
const insertPosition = content.indexOf('    </details>\n  </section>\n\n  <!-- 4.3 CHEMICAL PROPERTIES -->');

if (insertPosition !== -1) {
    content = content.slice(0, insertPosition) +
        '\n' + nomenclatureAddition + '\n' +
        content.slice(insertPosition);
}

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Colors updated from green to blue!');
console.log('✅ Nomenclature examples section added!');
