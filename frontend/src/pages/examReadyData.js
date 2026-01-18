import React from "react";
import { Calculator, Beaker } from "lucide-react";

export const examReadyData = {
    maths: {
        icon: React.createElement(Calculator, { size: 24 }),
        color: "from-blue-600 to-indigo-700",
        chapters: [
            {
                id: "number-system-9",
                name: "Number Systems",
                repeatedConcepts: [
                    { concept: "Rationalizing the Denominator", reason: "🔥 Most Probable 3/5M", marks: "3M" },
                    { concept: "Expressing decimal in p/q form", reason: "⭐ Core Concept", marks: "3M" },
                    { concept: "Laws of Exponents", reason: "✅ Calculation base", marks: "2M" }
                ],
                ncert: [
                    { ex: "Ex 1.1 Q2", pattern: "Find six rational numbers between 3 and 4.", marks: "2M" },
                    { ex: "Ex 1.1 Q3", pattern: "Find five rational numbers between 3/5 and 4/5.", marks: "3M" },
                    { ex: "Ex 1.2 Q3", pattern: "Show how √5 can be represented on the number line.", marks: "3M" },
                    {
                        ex: "Ex 1.3 Q3",
                        pattern: "Express the following in p/q form where p, q are integers:",
                        diagram: `<svg width="260" height="130" viewBox="0 0 260 130" xmlns="http://www.w3.org/2000/svg" class="text-slate-800 dark:text-white">
                            <g font-family="monospace" font-weight="900" font-size="22" fill="currentColor">
                                <!-- (i) 0.6 with bar on 6 -->
                                <text x="10" y="35">(i) 0.6</text>
                                <line x1="88" y1="15" x2="101" y2="15" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
                                
                                <!-- (ii) 0.47 with bar ONLY on 7 -->
                                <text x="10" y="75">(ii) 0.47</text>
                                <line x1="114" y1="55" x2="127" y2="55" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
                                
                                <!-- (iii) 0.001 with bar on 001 -->
                                <text x="10" y="115">(iii) 0.001</text>
                                <line x1="114" y1="95" x2="154" y2="95" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
                            </g>
                        </svg>`,
                        marks: "3M"
                    },
                    { ex: "Ex 1.3 Q7", pattern: "Write three numbers whose decimal expansions are non-terminating non-recurring.", marks: "3M" },
                    { ex: "Ex 1.3 Q8", pattern: "Find three different irrational numbers between the rational numbers 5/7 and 9/11 .", marks: "3M" },
                    { ex: "Ex 1.5 Q4", pattern: "Represent √9.3 on the number line.", marks: "3M" }
                ],
                exemplar: [
                    { pattern: "Find two rational numbers between 0.1 and 0.12.", type: "Conceptual" },
                    { pattern: "Simplify: (4√3 - 3√2) / (4√3 + 3√2)", type: "Numerical" }
                ],
                pyqs: [
                    { pattern: "Simplify (32^{1/5} + (-7)^0 + (64)^{1/2}).", freq: "High", marks: "3M" },
                    { pattern: "If x = 3 + 2√2, find value of x + 1/x.", freq: "Very High", marks: "4M" }
                ],
                repeatedPatterns: [
                    { topic: "Rationalization", preferred: "Conjugate multiplication", variation: "Multiple terms combined" },
                    { topic: "Decimal Expansion", preferred: "Terminating vs Non-Terminating", variation: "Pure vs Mixed recurring" }
                ],
                practice: [
                    { marks: "2M", questions: ["Find five rational numbers between 3/5 and 4/5."] },
                    { marks: "5M", questions: ["Rationalize: 1 / (√7 + √6 - √13)"] }
                ],
                tips: ["Sum of rational and irrational is always irrational.", "Remember laws of exponents: (a^m)^n = a^(mn)."]
            },
            {
                id: "polynomials-9",
                name: "Polynomials",
                repeatedConcepts: [
                    { concept: "Factor & Remainder Theorem", reason: "🔥 High Weightage", marks: "4M" },
                    { concept: "Algebraic Identities (Cubic)", reason: "⭐ Lengthy calculations", marks: "4M" },
                    { concept: "Middle Term Splitting", reason: "✅ Basic Skill", marks: "2M" }
                ],
                ncert: [
                    { ex: "Ex 2.4 Q5", pattern: "Factorize: x³ - 23x² + 142x - 120.", marks: "4M" },
                    { ex: "Ex 2.5 Q10", pattern: "Factorize 27y³ + 125z³ using identity.", marks: "3M" }
                ],
                exemplar: [
                    { pattern: "If x + 1/x = 7, find x³ + 1/x³.", type: "HOTS" },
                    { pattern: "Find zeros of p(x) = x² - 5x + 6.", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "Find value of k if x-1 is a factor of 4x³+3x²-4x+k.", freq: "High", marks: "2M" },
                    { pattern: "Evaluate 104 × 96 without direct multiplication.", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Factorization", preferred: "Trial & Error for cubic", variation: "Completing squares" },
                    { topic: "Identities", preferred: "(a+b+c)² and (a+b)³", variation: "Value estimation" }
                ],
                practice: [
                    { marks: "3M", questions: ["If x + y + z = 0, show x³+y³+z³ = 3xyz."] },
                    { marks: "4M", questions: ["Factorize: 8x³ + y³ + 27z³ - 18xyz"] }
                ],
                tips: ["Degree is the highest power of variable.", "Non-negative integers for powers define a polynomial."]
            },
            {
                id: "coordinate-geometry-9",
                name: "Coordinate Geometry",
                repeatedConcepts: [
                    { concept: "Quadrant signs", reason: "⭐ Scoring MCQ", marks: "1M" },
                    { concept: "Point identification", reason: "✅ Graph reading", marks: "2M" }
                ],
                ncert: [
                    { ex: "Ex 3.2 Q2", pattern: "Identify coordinates from Figure 3.14.", marks: "2M" }
                ],
                exemplar: [
                    { pattern: "Point on x-axis at distance 5 units from origin.", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "Plot the points A(2, 4), B(-2, 3) and find distance.", freq: "Medium", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Signs", preferred: "(+,+), (-,+), (-,-), (+,-)", variation: "Axis locations (x,0) or (0,y)" }
                ],
                practice: [
                    { marks: "1M", questions: ["In which quadrant does (-3, -5) lie?"] }
                ],
                tips: ["Abscissa is x-coordinate, Ordinate is y-coordinate."]
            },
            {
                id: "linear-equations-9",
                name: "Linear Equations in Two Variables",
                repeatedConcepts: [
                    { concept: "Solutions of Equation", reason: "🔥 Frequent numerical", marks: "2M" },
                    { concept: "Standard form ax+by+c=0", reason: "✅ Basic identification", marks: "1M" }
                ],
                ncert: [
                    { ex: "Ex 4.2 Q2", pattern: "Write four solutions for 2x + y = 7.", marks: "2M" },
                    { ex: "Ex 4.3 Q1", pattern: "Draw graph of x + y = 4.", marks: "4M" }
                ],
                exemplar: [
                    { pattern: "Does (2, 3) lie on the graph of 3x + y = 9?", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "Find k if x=2, y=1 is a solution of 2x+3y=k.", freq: "Very High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Graphs", preferred: "Parallel to axes", variation: "Taxicab word problems" }
                ],
                practice: [
                    { marks: "4M", questions: ["Draw graph of y - x = 2 and find area with axes."] }
                ],
                tips: ["x=constant is parallel to y-axis.", "y=constant is parallel to x-axis."]
            },
            {
                id: "euclids-geometry-9",
                name: "Introduction to Euclid's Geometry",
                repeatedConcepts: [
                    { concept: "Postulate 5 (Parallel Postulate)", reason: "🔥 Most Asked", marks: "2M" },
                    { concept: "Axioms vs Postulates", reason: "✅ Def based", marks: "1M" }
                ],
                ncert: [
                    { ex: "Ex 5.1 Q4", pattern: "If C lies between A and B, prove AC = 1/2 AB.", marks: "3M" }
                ],
                exemplar: [
                    { pattern: "List dimensions of point, line, and surface.", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "State Euclid's five postulates.", freq: "Medium", marks: "5M" }
                ],
                repeatedPatterns: [
                    { topic: "Proofs", preferred: "Equality of segments", variation: "Logical sequence of axioms" }
                ],
                practice: [
                    { marks: "2M", questions: ["Explain Axiom 1: Things equal to same thing are equal."] }
                ],
                tips: ["Axioms are universal truths, Postulates are specific to geometry."]
            },
            {
                id: "lines-angles-9",
                name: "Lines and Angles",
                repeatedConcepts: [
                    { concept: "Transversal & Parallel Lines", reason: "🔥 Core Geometry", marks: "3M" },
                    { concept: "Angle Sum Property", reason: "✅ Mandatory Theorem", marks: "3M" },
                    { concept: "Linear Pair", reason: "✅ Basic calculation", marks: "2M" }
                ],
                ncert: [
                    { ex: "Ex 6.2 Q1", pattern: "Find x and y if AB||CD.", marks: "3M" },
                    { ex: "Ex 6.3 Q5", pattern: "Find x and y in Fig 6.43.", marks: "3M" }
                ],
                exemplar: [
                    { pattern: "Prove sum of angles of a triangle is 180°.", type: "Theorem" }
                ],
                pyqs: [
                    { pattern: "Angles in ratio 2:4:3, find all angles.", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Theorems", preferred: "Alternate interior angles", variation: "Ratio based angles" }
                ],
                practice: [
                    { marks: "3M", questions: ["Prove vertically opposite angles are equal."] }
                ],
                tips: ["Complementary adds to 90°, Supplementary to 180°."]
            },
            {
                id: "triangles-9",
                name: "Triangles",
                repeatedConcepts: [
                    { concept: "Congruence Rules (SAS, ASA, SSS, RHS)", reason: "🔥 Fundamental", marks: "3M" },
                    { concept: "CPCT Properties", reason: "⭐ Key for proofs", marks: "3M" },
                    { concept: "Isosceles Triangle Properties", reason: "✅ Pattern repeater", marks: "3M" }
                ],
                ncert: [
                    { ex: "Ex 7.1 Q1", pattern: "Congruence proof of ∆ABC and ∆ABD.", marks: "3M" },
                    { ex: "Ex 7.2 Q5", pattern: "Show ∠ABD = ∠ACD for isosceles ∆.", marks: "3M" }
                ],
                exemplar: [
                    { pattern: "Is AAA a congruence criterion?", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "Prove angles opposite to equal sides are equal.", freq: "High", marks: "4M" }
                ],
                repeatedPatterns: [
                    { topic: "Congruence", preferred: "RHS in Right triangles", variation: "Altitude bisector proofs" }
                ],
                practice: [
                    { marks: "3M", questions: ["Show equilateral triangle angles are 60°."] }
                ],
                tips: ["Mention the congruence criteria (e.g., By SAS) clearly."]
            },
            {
                id: "quadrilaterals-9",
                name: "Quadrilaterals",
                repeatedConcepts: [
                    { concept: "Mid-Point Theorem", reason: "🔥 Guaranteed 5M", marks: "5M" },
                    { concept: "Parallelogram Properties", reason: "⭐ Numerical base", marks: "3M" }
                ],
                ncert: [
                    { ex: "Ex 8.1 Q1", pattern: "Angles ratio 3:5:9:13, find all.", marks: "3M" },
                    { ex: "Ex 8.2 Q1", pattern: "ABCD is quad, P,Q,R,S are midpoints. Prove.", marks: "5M" }
                ],
                exemplar: [
                    { pattern: "Diagonals of rectangle are equal. Proof?", type: "Theorem" }
                ],
                pyqs: [
                    { pattern: "State and prove Midpoint theorem.", freq: "Very High", marks: "5M" }
                ],
                repeatedPatterns: [
                    { topic: "Proofs", preferred: "Rhombus 90° diagonals", variation: "Square is special rectangle" }
                ],
                practice: [
                    { marks: "4M", questions: ["Show diagonals of square are equal."] }
                ],
                tips: ["Every Square is a Rhombus, but not every Rhombus is a Square."]
            },
            {
                id: "circles-9",
                name: "Circles",
                repeatedConcepts: [
                    { concept: "Angle at center vs circle", reason: "🔥 Pattern repeater", marks: "5M" },
                    { concept: "Cyclic Quadrilaterals", reason: "⭐ Theorem based", marks: "4M" },
                    { concept: "Equal chords properties", reason: "✅ Basic numericals", marks: "3M" }
                ],
                ncert: [
                    { ex: "Ex 10.4 Q2", pattern: "Intersecting equal chords proof.", marks: "4M" },
                    { ex: "Ex 10.5 Q1", pattern: "Find ∠ADC in circle figure.", marks: "3M" }
                ],
                exemplar: [
                    { pattern: "Angle in semicircle is 90°.", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "Prove opposite angles of cyclic quad sum to 180°.", freq: "High", marks: "4M" }
                ],
                repeatedPatterns: [
                    { topic: "Theorems", preferred: "Central angle double", variation: "Angles in same segment" }
                ],
                practice: [
                    { marks: "3M", questions: ["Find x if points are cyclic."] }
                ],
                tips: ["3 non-collinear points uniquely define a circle."]
            },
            {
                id: "herons-formula-9",
                name: "Heron's Formula",
                repeatedConcepts: [
                    { concept: "Area using s-calculation", reason: "⭐ Direct Marks", marks: "3M" },
                    { concept: "Application in Quads", reason: "🔥 Multi-step numerical", marks: "4M" }
                ],
                ncert: [
                    { ex: "Ex 12.1 Q3", pattern: "Find area of slide sides 15, 11, 6.", marks: "3M" }
                ],
                exemplar: [
                    { pattern: "Area of equilateral triangle side 10cm.", type: "Numerical" }
                ],
                pyqs: [
                    { pattern: "Perimeter 32, sides 8:11:x, find area.", freq: "High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Formula", preferred: "√s(s-a)(s-b)(s-c)", variation: "Isosceles area" }
                ],
                practice: [
                    { marks: "4M", questions: ["Calculate area of triangle sides 5, 12, 13."] }
                ],
                tips: ["Calculate semi-perimeter 's' carefully first."]
            },
            {
                id: "surface-area-volume-9",
                name: "Surface Areas and Volumes",
                repeatedConcepts: [
                    { concept: "Volume of Cone & Sphere", reason: "🔥 Formula Heavy", marks: "3M" },
                    { concept: "Total Surface Area", reason: "⭐ Pattern repeater", marks: "3M" },
                    { concept: "Curved Surface Area", reason: "✅ Calculation base", marks: "2M" }
                ],
                ncert: [
                    { ex: "Ex 13.7 Q1", pattern: "Volume of cone r=6, h=7.", marks: "2M" },
                    { ex: "Ex 13.8 Q1", pattern: "Volume of sphere r=7.", marks: "2M" }
                ],
                exemplar: [
                    { pattern: "Sphere radius tripled, new volume factor?", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "TSA of hemisphere r=10.", freq: "High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Ratios", preferred: "Area vs Volume ratios", variation: "Melt/Recast sphere to cone" }
                ],
                practice: [
                    { marks: "5M", questions: ["Cost of canvas for conical tent."] }
                ],
                tips: ["TSA Sphere = 4πr², HSA = 3πr²."]
            },
            {
                id: "statistics-9",
                name: "Statistics",
                repeatedConcepts: [
                    { concept: "Bar graphs & Histograms", reason: "⭐ Drawing skill", marks: "4M" },
                    { concept: "Frequency Polygons", reason: "🔥 Visualization", marks: "4M" },
                    { concept: "Mean/Median/Mode", reason: "✅ Direct scoring", marks: "3M" }
                ],
                ncert: [
                    { ex: "Ex 14.3 Q1", pattern: "Draw Histogram for data.", marks: "4M" }
                ],
                exemplar: [
                    { pattern: "Mode of a given data set.", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "Mean of first 10 natural numbers.", freq: "Medium", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Median", preferred: "Odd/Even n formula", variation: "Frequency polygon drawing" }
                ],
                practice: [
                    { marks: "3M", questions: ["Find median of data set."] }
                ],
                tips: ["Check if data is continuous for Histograms."]
            }
        ]
    },
    science: {
        icon: React.createElement(Beaker, { size: 24 }),
        color: "from-emerald-600 to-teal-700",
        chapters: [
            {
                id: "matter-surroundings-9",
                name: "Matter in Our Surroundings",
                repeatedConcepts: [
                    { concept: "States of Matter Properties", reason: "S/L/G comparison", marks: "2M" },
                    { concept: "Evaporation Factors", reason: "🔥 High priority theory", marks: "3M" }
                ],
                ncert: [{ ex: "Intxt", pattern: "Why desert cooler cools?", marks: "2M" }],
                exemplar: [{ pattern: "Latent heat of fusion vs vaporization.", type: "Theory" }],
                pyqs: [{ pattern: "Boiling vs Evaporation.", freq: "High", marks: "3M" }],
                repeatedPatterns: [{ topic: "Phases", preferred: "Sublimation (Ammonium Chloride)", variation: "Dry ice properties" }],
                practice: [{ marks: "2M", questions: ["Define Sublimation."] }],
                tips: ["Particles of matter possess kinetic energy."]
            },
            {
                id: "pure-matter-9",
                name: "Is Matter Around Us Pure",
                repeatedConcepts: [
                    { concept: "Solutions/Suspensions/Colloids", reason: "Table comparison", marks: "3M" },
                    { concept: "Separation Techniques", reason: "🔥 Apparatus diagrams", marks: "5M" }
                ],
                ncert: [{ ex: "Ex Q3", pattern: "Hetero vs Homo mixtures.", marks: "2M" }],
                exemplar: [{ pattern: "Chromatography application.", type: "Application" }],
                pyqs: [{ pattern: "Fractional distillation set up.", freq: "High", marks: "5M" }],
                repeatedPatterns: [{ topic: "Tyndall Effect", preferred: "Colloidal solution", variation: "Crystallization benefits" }],
                practice: [{ marks: "3M", questions: ["Separate pigments from ink."] }],
                tips: ["Pure substance vs Mixture classification is key."]
            },
            {
                id: "atoms-molecules-9",
                name: "Atoms and Molecules",
                repeatedConcepts: [
                    { concept: "Mole Concept", reason: "🔥 Mathematical Core", marks: "5M" },
                    { concept: "Laws of Chemical Combination", reason: "⭐ Mass/Proportions", marks: "3M" }
                ],
                ncert: [{ ex: "Ex Q1", pattern: "Calculate molecular mass.", marks: "3M" }],
                exemplar: [{ pattern: "Avogadro number value and meaning.", type: "MCQ" }],
                pyqs: [{ pattern: "Mass of 0.5 mole Nitrogen gas.", freq: "Very High", marks: "3M" }],
                repeatedPatterns: [{ topic: "Formulae", preferred: "Valency cross method", variation: "Atomic mass units" }],
                practice: [{ marks: "3M", questions: ["Formula for Aluminum Chloride."] }],
                tips: ["1 mole = 6.022 × 10²³ particles."]
            },
            {
                id: "atom-structure-9",
                name: "Structure of the Atom",
                repeatedConcepts: [
                    { concept: "Atomic Models (Rutherford/Bohr)", reason: "🔥 Diagrams + Limitations", marks: "5M" },
                    { concept: "Valency & Configurations", reason: "⭐ Shell filling", marks: "3M" }
                ],
                ncert: [{ ex: "Ex Q4", pattern: "Sodium electron configuration.", marks: "3M" }],
                exemplar: [{ pattern: "Isotopes and Isobars comparison.", type: "Knowledge" }],
                pyqs: [{ pattern: "Valency of Sulfur and Chlorine.", freq: "High", marks: "2M" }],
                repeatedPatterns: [{ topic: "Shells", preferred: "2, 8, 8 rule", variation: "Proton/Neutron calculation" }],
                practice: [{ marks: "2M", questions: ["Find valency of Oxygen."] }],
                tips: ["Atomic number = Number of protons."]
            },
            {
                id: "life-unit-9",
                name: "The Fundamental Unit of Life",
                repeatedConcepts: [
                    { concept: "Cell Organelles & Functions", reason: "⭐ Nucleus/Mito/Ribs", marks: "3M" },
                    { concept: "Plant vs Animal Cell", reason: "🔥 Diagrams expected", marks: "5M" }
                ],
                ncert: [{ ex: "Ex Q1", pattern: "Cell organelle comparison.", marks: "5M" }],
                exemplar: [{ pattern: "Plasmolysis in plant cells.", type: "Conceptual" }],
                pyqs: [{ pattern: "Osmosis in raisins experiment.", freq: "High", marks: "3M" }],
                repeatedPatterns: [{ topic: "Organelles", preferred: "Powerhouse role", variation: "Suicide bags (Lysosomes)" }],
                practice: [{ marks: "3M", questions: ["Structure of Golgi apparatus."] }],
                tips: ["Cells are units of life discovered by Robert Hooke."]
            },
            {
                id: "tissues-9",
                name: "Tissues",
                repeatedConcepts: [
                    { concept: "Meristematic vs Permanent", reason: "⭐ Growth types", marks: "3M" },
                    { concept: "Animal Tissue Types", reason: "🔥 Epithelial/Connective/Muscular/Nervous", marks: "5M" }
                ],
                ncert: [{ ex: "Ex Q1", pattern: "Differences in plant/animal tissues.", marks: "3M" }],
                exemplar: [{ pattern: "Ligament vs Tendon differences.", type: "Conceptual" }],
                pyqs: [{ pattern: "Neuron diagram and parts.", freq: "High", marks: "5M" }],
                repeatedPatterns: [{ topic: "Muscles", preferred: "Smooth vs Striated", variation: "Xylem components" }],
                practice: [{ marks: "5M", questions: ["Label a nerve cell."] }],
                tips: ["Blood is fluid connective tissue."]
            },
            {
                id: "diversity-9",
                name: "Diversity in Living Organisms",
                repeatedConcepts: [
                    { concept: "Five Kingdom Classification", reason: "🔥 Feature table", marks: "5M" },
                    { concept: "Kingdom Plantae/Animalia classes", reason: "⭐ Characteristics", marks: "5M" }
                ],
                ncert: [{ ex: "Ex Q3", pattern: "Differentiate Monera and Protista.", marks: "3M" }],
                exemplar: [{ pattern: "Binomial nomenclature rules.", type: "Knowledge" }],
                pyqs: [{ pattern: "Features of Arthropoda (Jointed legs).", freq: "High", marks: "3M" }],
                repeatedPatterns: [{ topic: "Phyla", preferred: "Vertebrata classes", variation: "Gymnosperms vs Angiosperms" }],
                practice: [{ marks: "5M", questions: ["Compare Mammalia and Aves."] }],
                tips: ["Whittaker proposed the 5-kingdom system."]
            },
            {
                id: "motion-9",
                name: "Motion",
                repeatedConcepts: [
                    { concept: "Equations of Motion (Graphical)", reason: "🔥 Mandatory Proofs", marks: "5M" },
                    { concept: "Distance vs Displacement", reason: "✅ Conceptual base", marks: "2M" },
                    { concept: "v-t & s-t Graphs", reason: "⭐ Interpretation", marks: "3M" }
                ],
                ncert: [{ ex: "Ex Q4", pattern: "Numerical on acceleration.", marks: "3M" }],
                exemplar: [{ pattern: "Vector vs Scalar quantities.", type: "Conceptual" }],
                pyqs: [{ pattern: "Derive v=u+at graphically.", freq: "Very High", marks: "5M" }],
                repeatedPatterns: [{ topic: "Terms", preferred: "Uniform circular motion", variation: "Area under v-t graph" }],
                practice: [{ marks: "3M", questions: ["Define Displacement."] }],
                tips: ["Slope of D-T graph = Velocity."]
            },
            {
                id: "force-motion-9",
                name: "Force and Laws of Motion",
                repeatedConcepts: [
                    { concept: "Newton's Laws (1, 2, 3)", reason: "🔥 Foundation", marks: "5M" },
                    { concept: "Conservation of Momentum", reason: "⭐ Numerical Core", marks: "5M" },
                    { concept: "Inertia Examples", reason: "✅ Reasoning based", marks: "2M" }
                ],
                ncert: [{ ex: "Ex Q1", pattern: "Inertia examples in daily life.", marks: "2M" }],
                exemplar: [{ pattern: "F = ma derivation using 2nd Law.", type: "Theorem" }],
                pyqs: [{ pattern: "Gun recoil numerical (p_i = p_f).", freq: "High", marks: "3M" }],
                repeatedPatterns: [{ topic: "Inertia", preferred: "Passenger moving in bus", variation: "Carrom striker hitting coins" }],
                practice: [{ marks: "3M", questions: ["Explain Law of Inertia."] }],
                tips: ["Momentum p = mv. S.I unit is kg m/s."]
            },
            {
                id: "gravitation-9",
                name: "Gravitation",
                repeatedConcepts: [
                    { concept: "Universal Law of Gravitation", reason: "⭐ Numerical Base", marks: "3M" },
                    { concept: "Mass vs Weight", reason: "🔥 Difference table", marks: "2M" },
                    { concept: "Archimedes' Principle & Buoyancy", reason: "⭐ High probability", marks: "3M" }
                ],
                ncert: [{ ex: "Ex Q1", pattern: "Gravitation force distance change.", marks: "2M" }],
                exemplar: [{ pattern: "Why g varies from poles to equator?", type: "Conceptual" }],
                pyqs: [{ pattern: "Weight of object on moon (1/6th).", freq: "Very High", marks: "3M" }],
                repeatedPatterns: [{ topic: "Density", preferred: "Relative density", variation: "Floatation conditions" }],
                practice: [{ marks: "3M", questions: ["Archimedes' Principle explanation."] }],
                tips: ["g = 9.8 m/s² on Earth."]
            },
            {
                id: "work-energy-9",
                name: "Work, Power and Energy",
                repeatedConcepts: [
                    { concept: "Law of Conservation of Energy", reason: "🔥 Proof + Free fall", marks: "5M" },
                    { concept: "KE and PE Formulae", reason: "⭐ Numerical Core", marks: "3M" },
                    { concept: "Commercial Unit (kWh)", reason: "✅ Calculation base", marks: "3M" }
                ],
                ncert: [{ ex: "Ex Q10", pattern: "Object raised to height PE.", marks: "2M" }],
                exemplar: [{ pattern: "When is work done zero?", type: "Theory" }],
                pyqs: [{ pattern: "kWh to Joules conversion.", freq: "High", marks: "3M" }],
                repeatedPatterns: [{ topic: "Conservation", preferred: "Pendulum example", variation: "Power calculations" }],
                practice: [{ marks: "3M", questions: ["Define 1 Watt of power."] }],
                tips: ["W = Fs (Joules). 1 kWh = 3.6 × 10⁶ J."]
            },
            {
                id: "sound-9",
                name: "Sound",
                repeatedConcepts: [
                    { concept: "Echo & SONAR", reason: "🔥 Application Numericals", marks: "4M" },
                    { concept: "Reflection of Sound", reason: "⭐ Law based", marks: "2M" },
                    { concept: "Human Ear Structure", reason: "✅ Diagram + Function", marks: "5M" }
                ],
                ncert: [{ ex: "Ex Q5", pattern: "Echo distance problem (v = 2d/t).", marks: "3M" }],
                exemplar: [{ pattern: "Compression vs Rarefaction.", type: "Conceptual" }],
                pyqs: [{ pattern: "Range of audible sound (20Hz-20kHz).", freq: "High", marks: "2M" }],
                repeatedPatterns: [{ topic: "Waves", preferred: "Longitudinal waves", variation: "Ultra vs Infrasound" }],
                practice: [{ marks: "4M", questions: ["How speed of sound changes with media?"] }],
                tips: ["Sound needs a medium (vacuum not possible)."]
            },
            {
                id: "ill-9",
                name: "Why Do We Fall Ill",
                repeatedConcepts: [
                    { concept: "Infectious vs Non-infectious", reason: "⭐ Basic grouping", marks: "3M" },
                    { concept: "Prevention Principles (Vaccination)", reason: "🔥 Preventive health", marks: "3M" }
                ],
                ncert: [{ ex: "Ex Q1", pattern: "Healthy vs Disease-free.", marks: "2M" }],
                exemplar: [{ pattern: "Pathogens listed per disease.", type: "Knowledge" }],
                pyqs: [{ pattern: "Ways of transmission of AIDS.", freq: "High", marks: "3M" }],
                repeatedPatterns: [{ topic: "Immunity", preferred: "Innate vs Acquired", variation: "Antibiotic function" }],
                practice: [{ marks: "3M", questions: ["What is an immunization program?"] }],
                tips: ["Prevention is better than cure."]
            },
            {
                id: "natural-resources-9",
                name: "Natural Resources",
                repeatedConcepts: [
                    { concept: "Biogeochemical Cycles", reason: "🔥 Nitrogen/Carbon/Water diagrams", marks: "5M" },
                    { concept: "Greenhouse Effect & Global Warming", reason: "⭐ Environmental", marks: "3M" }
                ],
                ncert: [{ ex: "Ex Q1", pattern: "Role of atmosphere in temperature.", marks: "2M" }],
                exemplar: [{ pattern: "Lichens role as pollution indicator.", type: "Conceptual" }],
                pyqs: [{ pattern: "Nitrogen Cycle detailed diagram.", freq: "High", marks: "5M" }],
                repeatedPatterns: [{ topic: "Cycles", preferred: "Oxygen/CO2 cycle", variation: "Soil erosion causes" }],
                practice: [{ marks: "3M", questions: ["Difference between Breath and Respiration?"] }],
                tips: ["Fixation by bacteria is key in Nitrogen cycle."]
            },
            {
                id: "food-resources-9",
                name: "Improvement in Food Resources",
                repeatedConcepts: [
                    { concept: "Crop Protection & Management", reason: "⭐ Storage loss", marks: "3M" },
                    { concept: "Manure vs Fertilizers", reason: "🔥 Comparison Table", marks: "3M" },
                    { concept: "Animal Husbandry (Bee/Fish/Poultry)", reason: "⭐ Yield improvement", marks: "5M" }
                ],
                ncert: [{ ex: "Ex Q1", pattern: "Methods to increase crop yield.", marks: "3M" }],
                exemplar: [{ pattern: "Macronutrients needed by plants.", type: "MCQ" }],
                pyqs: [{ pattern: "Advantages of Bee-keeping.", freq: "Medium", marks: "2M" }],
                repeatedPatterns: [{ topic: "Systems", preferred: "Inter-cropping vs Rotation", variation: "Irrigation types" }],
                practice: [{ marks: "3M", questions: ["What is Green Revolution?"] }],
                tips: ["Sustainable agriculture reduces environmental harm."]
            }
        ]
    }
};
