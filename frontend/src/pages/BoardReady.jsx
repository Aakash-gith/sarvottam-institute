import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
    FileText,
    ArrowLeft,
    ChevronRight,
    Target,
    CheckCircle2,
    Star,
    BookOpen,
    Award,
    HelpCircle,
    Layout,
    Search,
    Filter,
    Calculator,
    Beaker,
    Atom,
    Dna,
    Zap,
    Eye,
    Activity,
    ChevronDown,
    BrainCircuit,
    Timer
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { examReadyData } from "./examReadyData";

// --- DATA STRUCTURE ---
const boardReadyData = {
    maths: {
        icon: <Calculator size={24} />,
        color: "from-blue-600 to-indigo-700",
        chapters: [
            {
                id: "real-numbers",
                name: "Real Numbers",
                repeatedConcepts: [
                    { concept: "Proof of Irrationality (√2, √3, √5)", reason: "🔥 Frequently Repeated", marks: "3M" },
                    { concept: "Fundamental Theorem of Arithmetic (HCF × LCM)", reason: "⭐ High Board Weightage", marks: "2M" }
                ],
                ncert: [
                    { ex: "Ex 1.1 Q2", pattern: "Find the LCM and HCF of 26 and 91 and verify that LCM × HCF = product of the two numbers.", marks: "2M" },
                    { ex: "Ex 1.1 Q3", pattern: "Find the LCM and HCF of 12, 15 and 21 by applying the prime factorisation method.", marks: "2M" },
                    { ex: "Ex 1.2 Q1", pattern: "Prove that √5 is irrational.", marks: "3M" },
                    { ex: "Ex 1.2 Q2", pattern: "Prove that 3 + 2√5 is irrational.", marks: "3M" }
                ],
                exemplar: [
                    { pattern: "A positive integer is of the form 3q + 1. Can its square be in form 3m or 3m + 2? Justify.", type: "Conceptual" },
                    { pattern: "Can two numbers have 18 as HCF and 380 as LCM? Give reasons.", type: "HOTS" }
                ],
                pyqs: [
                    { pattern: "Prove √3 is irrational.", freq: "Very High", marks: "3M" },
                    { pattern: "Find HCF and LCM of 404 and 96.", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Irrationality", preferred: "Proof by Contradiction", variation: "Sum/Difference logic" }
                ],
                practice: [
                    { marks: "3M", questions: ["Prove that √5 is irrational.", "Check if 6ⁿ can end with 0."] },
                    { marks: "5M", questions: ["Case Study: An army contingent of 616 members is to march behind a band of 32 members. Find max columns.", "Determine HCF of 441, 567, 693."] }
                ],
                tips: ["Clearly state the assumption 'Let √5 be rational'.", "Show prime factorization steps."]
            },
            {
                id: "polynomials",
                name: "Polynomials",
                repeatedConcepts: [
                    { concept: "Relationship between Zeros and Coefficients", reason: "🔥 Frequently Repeated", marks: "2M / 3M" },
                ],
                ncert: [
                    { ex: "Ex 2.2 Q1", pattern: "Find the zeroes of the quadratic polynomial x² - 2x - 8 and verify relationship with coefficients.", marks: "3M" },
                    { ex: "Ex 2.2 Q2", pattern: "Find a quadratic polynomial, the sum and product of whose zeroes are 1/4 and -1 respectively.", marks: "2M" }
                ],
                exemplar: [
                    { pattern: "If zeroes of ax² + bx + c are both positive, then a, b, c have same sign. True/False?", type: "Conceptual" },
                    { pattern: "Can x² + kx + k have equal zeroes for some odd integer k > 1?", type: "HOTS" }
                ],
                pyqs: [
                    { pattern: "If α, β are zeroes of x² - 5x + 6, find 1/α + 1/β.", freq: "High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Zero relations", preferred: "Sum and Product verification", variation: "Find unknown coeff" }
                ],
                practice: [
                    { marks: "3M", questions: ["Find zeroes of 6x² - 3 - 7x.", "Find quadratic poly whose sum is 0, product is √5."] },
                    { marks: "5M", questions: ["Case Study: Parabola gate entry represented by x² - 4x + 3. Find its zeros.", "Find all zeros of 2x⁴ - 3x³ - 3x² + 6x - 2 if √2 and -√2 are zeros."] }
                ],
                tips: ["α + β = -b/a. Watch the signs!"]
            },
            {
                id: "linear-equations",
                name: "Pair of Linear Equations",
                repeatedConcepts: [
                    { concept: "Consistency/Inconsistency Conditions", reason: "🔥 Frequently Repeated", marks: "1M / 2M" },
                ],
                ncert: [
                    { ex: "Ex 3.2 Q2", pattern: "On comparing ratios, find if 5x - 4y + 8 = 0 and 7x + 6y - 9 = 0 are intersecting, parallel or coincident.", marks: "1M" },
                    { ex: "Ex 3.3 Q3(ii)", pattern: "Larger of two supplementary angles exceeds smaller by 18°. Find them.", marks: "3M" },
                    { ex: "Ex 3.3 Q3(v)", pattern: "A fraction becomes 9/11 if 2 is added... if 3 is added it becomes 5/6. Find fraction.", marks: "3M" }
                ],
                exemplar: [
                    { pattern: "For what value of k, do 3x - y + 8 = 0 and 6x - ky = -16 represent coincident lines?", type: "HOTS" },
                    { pattern: "If lines 3x + 2ky = 2 and 2x + 5y + 1 = 0 are parallel, find k.", type: "Application" }
                ],
                pyqs: [
                    { pattern: "Solve: 99x + 101y = 499; 101x + 99y = 501.", freq: "High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Conditions", preferred: "Ratios comparison", variation: "Word problems to equations" }
                ],
                practice: [
                    { marks: "3M", questions: ["Solve 2x + 3y = 11 and 2x - 4y = -24.", "Age of Jacob and son word problem."] },
                    { marks: "5M", questions: ["Case Study: Taxi charges fixed 105 for 10km, 155 for 15km. Find for 25km.", "Boat upstream 30km, downstream 44km in 10h... find speed."] }
                ],
                tips: ["Define x and y clearly with units."]
            },
            {
                id: "quadratic-equations",
                name: "Quadratic Equations",
                repeatedConcepts: [
                    { concept: "Nature of Roots", reason: "🔥 Frequently Repeated", marks: "2M" },
                ],
                ncert: [
                    { ex: "Ex 4.2 Q3", pattern: "Find two numbers whose sum is 27 and product is 182.", marks: "3M" },
                    { ex: "Ex 4.2 Q6", pattern: "Pottery cost production word problem... total cost 90. Find articles.", marks: "5M" },
                    { ex: "Ex 4.3 Q2", pattern: "Find k so that 2x² + kx + 3 = 0 has equal roots.", marks: "2M" }
                ],
                exemplar: [
                    { pattern: "Reciprocals of Rehman's ages 3yr ago and 5yr from now sum to 1/3. Find age.", type: "HOTS" },
                    { pattern: "Train travels 360 km... if 5km/h more, 1h less. Find speed.", type: "Application" }
                ],
                pyqs: [
                    { pattern: "Solve for x: 1/(x+4) - 1/(x-7) = 11/30.", freq: "Very High", marks: "4M" }
                ],
                repeatedPatterns: [
                    { topic: "Discriminant", preferred: "D = b² - 4ac", variation: "Real and equal roots logic" }
                ],
                practice: [
                    { marks: "3M", questions: ["Find roots of x² - 3x - 10 = 0.", "Nature of roots of 2x² - 3x + 5 = 0."] },
                    { marks: "5M", questions: ["Case Study: Mango grove length twice breadth area 800m². Find l, b.", "Sum of squares of two consecutive odd positive integers is 394."] }
                ],
                tips: ["Check D > 0 before solving."]
            },
            {
                id: "ap",
                name: "Arithmetic Progressions",
                repeatedConcepts: [
                    { concept: "Sum of n terms", reason: "🔥 Frequently Repeated", marks: "3M / 5M" },
                    { concept: "Case Study 2026", reason: "⭐ High Board Weightage", marks: "4M" }
                ],
                ncert: [
                    { ex: "Ex 5.2 Q13", pattern: "How many three-digit numbers are divisible by 7?", marks: "3M" },
                    { ex: "Ex 5.2 Q17", pattern: "Find the 20th term from the last term of the AP: 3, 8, 13, ..., 253.", marks: "3M" },
                    { ex: "Ex 5.3 Q9", pattern: "If sum of first 7 terms is 49 and 17 terms is 289, find sum of n terms.", marks: "5M" },
                    { ex: "Ex 5.3 Q11", pattern: "If Sn = 4n - n², find 10th and nth terms.", marks: "4M" }
                ],
                exemplar: [
                    { pattern: "Sum of 5th and 7th terms is 52 and 10th term is 46. Find the AP.", type: "HOTS" },
                    { pattern: "8th term is half 2nd term, 11th exceeds 1/3 of 4th by 1. Find 15th term.", type: "HOTS" }
                ],
                pyqs: [
                    { pattern: "Find sum of all 2-digit numbers divisible by 3.", freq: "High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Summation", preferred: "Sn formula usage", variation: "n-th term from end" }
                ],
                practice: [
                    { marks: "3M", questions: ["Find 31st term if 11th is 38, 16th is 73.", "How many multiples of 4 between 10 and 250?"] },
                    { marks: "5M", questions: ["Case Study: A spiral total length of 13 spirals with radii 0.5, 1.0, 1.5...", { text: "Case Study: In a row of houses, houses are numbered 1 to 49. Show there's a house x such that sum of preceding equals sum of following.", diagram: `<svg viewBox="0 0 100 20" className="w-40 mx-auto"><rect x="10" y="5" width="10" height="10" stroke="currentColor" fill="none"/><rect x="25" y="5" width="10" height="10" stroke="currentColor" fill="none"/><rect x="40" y="5" width="10" height="10" stroke="currentColor" fill="none"/><text x="42" y="12" fontSize="4">x</text><rect x="55" y="5" width="10" height="10" stroke="currentColor" fill="none"/><rect x="70" y="5" width="10" height="10" stroke="currentColor" fill="none"/><rect x="85" y="5" width="10" height="10" stroke="currentColor" fill="none"/></svg>` }] }
                ],
                tips: ["Remember n is always a natural number."]
            },
            {
                id: "triangles",
                name: "Triangles",
                repeatedConcepts: [
                    { concept: "Basic Proportionality Theorem (BPT)", reason: "🔥 Frequently Repeated", marks: "5M" },
                ],
                ncert: [
                    { ex: "Ex 6.2 Q1", pattern: "In figure (i) and (ii), DE || BC. Find EC in (i) and AD in (ii).", marks: "2M", diagram: `<svg viewBox="0 0 100 60" className="w-40 mx-auto"><path d="M50 5 L10 50 L90 50 Z" fill="none" stroke="currentColor"/><line x1="28" y1="30" x2="72" y2="30" stroke="currentColor"/><text x="48" y="3" fontSize="4">A</text><text x="6" y="54" fontSize="4">B</text><text x="92" y="54" fontSize="4">C</text><text x="24" y="32" fontSize="4">D</text><text x="74" y="32" fontSize="4">E</text></svg>` },
                    { ex: "Ex 6.3 Q4", pattern: "In figure, QR/QS = QT/PR and ∠1 = ∠2. Show that ∆PQS ~ ∆TQR.", marks: "3M" }
                ],
                exemplar: [
                    { pattern: "Prove if a line parallel to one side of triangle intersects other two, they are divided in same ratio.", type: "HOTS" },
                    { pattern: "15m tower shadow 24m. Same time pole shadow 16m. Find pole height.", type: "Application" }
                ],
                pyqs: [
                    { pattern: "Prove BPT Theorem.", freq: "Very High", marks: "5M" }
                ],
                repeatedPatterns: [
                    { topic: "Similarity", preferred: "AA Similarity", variation: "Ratios of sides logic" }
                ],
                practice: [
                    { marks: "3M", questions: ["Prove AA similarity criterion.", "Sides of triangle are 7, 24, 25. Is it right triangle?"] },
                    { marks: "5M", questions: ["State and prove Basic Proportionality Theorem.", "Case Study: Ladder 10m reaches window 8m high. Find distance from base."] }
                ],
                tips: ["State 'Given', 'To Prove' and 'Construction' clearly."]
            },
            {
                id: "coordinate",
                name: "Coordinate Geometry",
                repeatedConcepts: [
                    { concept: "Section Formula", reason: "🔥 Frequently Repeated", marks: "3M" },
                ],
                ncert: [
                    { ex: "Ex 7.1 Q3", pattern: "Determine if (1, 5), (2, 3) and (-2, -11) are collinear.", marks: "2M" },
                    { ex: "Ex 7.1 Q7", pattern: "Find point on x-axis equidistant from (2, -5) and (-2, 9).", marks: "3M" },
                    { ex: "Ex 7.2 Q2", pattern: "Find coordinates of trisection points of segment joining (4, -1) and (-2, -3).", marks: "3M", diagram: `<svg viewBox="0 0 100 20" className="w-40 mx-auto"><line x1="10" y1="10" x2="90" y2="10" stroke="currentColor"/><circle cx="10" cy="10" r="1"/><circle cx="36" cy="10" r="1"/><circle cx="63" cy="10" r="1"/><circle cx="90" cy="10" r="1"/></svg>` }
                ],
                exemplar: [
                    { pattern: "Find point dividing segment A(-2, 2) and B(2, 8) into four equal parts.", type: "HOTS" },
                    { pattern: "Find relation between x and y such that (x, y) is equidistant from (3, 6) and (-3, 4).", type: "Application" }
                ],
                pyqs: [
                    { pattern: "Find area of quadrilateral with vertices (-4,-2), (-3,-5), (3,-2), (2,3).", freq: "High", marks: "4M" }
                ],
                repeatedPatterns: [
                    { topic: "Equidistant", preferred: "Distance^2 equality", variation: "Ratio finding using axis" }
                ],
                practice: [
                    { marks: "2M", questions: ["Distance between (2,3) and (4,1).", "Find y if dist between (2,-3) and (10,y) is 10."] },
                    { marks: "5M", questions: ["Case Study: Students seated in classroom at (3,4), (6,7), (9,4), (6,1). Is seated area a square?"] }
                ],
                tips: ["Y=0 on x-axis."]
            },
            {
                id: "trigo-intro",
                name: "Intro to Trigonometry",
                repeatedConcepts: [
                    { concept: "Identity Proofs", reason: "🔥 Frequently Repeated", marks: "5M" },
                    { concept: "Specific Angles (0-90°)", reason: "⭐ High Board Weightage", marks: "2M" }
                ],
                ncert: [
                    { ex: "Ex 8.1 Q8", pattern: "If 3 cot A = 4, check whether (1 - tan² A) / (1 + tan² A) = cos² A - sin² A.", marks: "3M" },
                    { ex: "Ex 8.2 Q3", pattern: "If tan(A+B) = √3 and tan(A-B) = 1/√3; 0° < A+B ≤ 90°; A > B, find A and B.", marks: "3M" },
                    { ex: "Ex 8.3 Q4(viii)", pattern: "Prove (sin A + cosec A)² + (cos A + sec A)² = 7 + tan² A + cot² A.", marks: "5M" },
                    { ex: "Ex 8.3 Q4(x)", pattern: "Prove (1+tan²A)/(1+cot²A) = ((1-tan A)/(1-cot A))² = tan²A.", marks: "4M" }
                ],
                exemplar: [
                    { pattern: "Prove √(sec²θ + cosec²θ) = tanθ + cotθ.", type: "HOTS" },
                    { pattern: "If 1 + sin²θ = 3sinθ cosθ, prove tanθ = 1 or 1/2.", type: "Application" }
                ],
                pyqs: [
                    { pattern: "Prove (cosec θ - cot θ)² = (1-cos θ)/(1+cos θ).", freq: "Very High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Identities", preferred: "Conversion to sin/cos", variation: "Algebraic identities use" }
                ],
                practice: [
                    { marks: "3M", questions: ["If tan(A+B)=√3, tan(A-B)=1/√3, find A, B.", "Evaluate sin 60 cos 30 + sin 30 cos 60."] },
                    { marks: "5M", questions: ["Prove: (sinθ - cosθ + 1) / (sinθ + cosθ - 1) = 1 / (secθ - tanθ).", "Prove cos A / (1 + sin A) + (1 + sin A) / cos A = 2 sec A."] }
                ],
                tips: ["Memorize the angle table."]
            },
            {
                id: "trigo-app",
                name: "Trigonometry Application",
                repeatedConcepts: [
                    { concept: "Two-Triangle Observation (Height/Distance)", reason: "🔥 Frequently Repeated", marks: "5M" },
                    { concept: "Case Study 2026 Focus", reason: "⭐ High Board Weightage", marks: "4M" }
                ],
                ncert: [
                    { ex: "Ex 9.1 Q6", pattern: "1.5m boy looks at 30m building. Angle 30° to 60° as he moves. Find distance.", marks: "5M", diagram: `<svg viewBox="0 0 100 40" className="w-40 mx-auto"><line x1="10" y1="35" x2="90" y2="35" stroke="currentColor"/><rect x="80" y="5" width="5" height="30" stroke="currentColor" fill="none"/><line x1="10" y1="35" x2="80" y2="5" stroke="currentColor" strokeDasharray="2"/><line x1="35" y1="35" x2="80" y2="5" stroke="currentColor" strokeDasharray="2"/></svg>` },
                    { ex: "Ex 9.1 Q12", pattern: "Top of 7m building, elevation of tower 60°, depression of foot 45°. Find height.", marks: "4M" },
                    { ex: "Ex 9.1 Q16", pattern: "Elevation from points 4m and 9m are complementary. Prove height 6m.", marks: "5M" }
                ],
                exemplar: [
                    { pattern: "Vertical tower staff height h. Angles α, β. Prove tower is [h tan α/(tan β – tan α)].", type: "HOTS" },
                    { pattern: "Shadow 50m longer when elevation is 30° than 60°. Find height.", type: "Application" }
                ],
                pyqs: [
                    { pattern: "Two poles equal height, 80m apart. Elevation 60° and 30°. Find height.", freq: "High", marks: "5M" }
                ],
                repeatedPatterns: [
                    { topic: "Double Triangle", preferred: "Forming two tan equations", variation: "Observer eye height vs ground" }
                ],
                practice: [
                    { marks: "3M", questions: ["Tree breaking due to storm touches 30° at 8m. Find height.", "Angle elevation from 30m away is 30°."] },
                    { marks: "5M", questions: [{ text: "Case Study: A straight highway leads to foot of tower. Man at top sees car at 30°. 6 seconds later car is at 60°. Find additional time.", diagram: `<svg viewBox="0 0 100 40" className="w-40 mx-auto"><line x1="10" y1="35" x2="90" y2="35" stroke="currentColor"/><line x1="90" y1="35" x2="90" y2="5" stroke="currentColor"/><line x1="90" y1="5" x2="10" y2="35" stroke="currentColor" strokeDasharray="2"/><line x1="90" y1="5" x2="50" y2="35" stroke="currentColor" strokeDasharray="2"/></svg>` }] }
                ],
                tips: ["Draw diagrams with labels."]
            },
            {
                id: "circles",
                name: "Circles",
                repeatedConcepts: [
                    { concept: "Tangents from external point", reason: "🔥 Frequently Repeated", marks: "3M / 5M" },
                ],
                ncert: [
                    { ex: "Theorem 10.2", pattern: "Prove that the lengths of tangents drawn from an external point to a circle are equal.", marks: "3M", diagram: `<svg viewBox="0 0 100 40" className="w-40 mx-auto"><circle cx="60" cy="20" r="15" stroke="currentColor" fill="none"/><line x1="15" y1="20" x2="52" y2="7" stroke="currentColor"/><line x1="15" y1="20" x2="52" y2="33" stroke="currentColor"/></svg>` },
                    { ex: "Ex 10.2 Q8", pattern: "Quadrilateral ABCD circumscribes circle. Prove AB + CD = AD + BC.", marks: "3M" },
                    { ex: "Ex 10.2 Q12", pattern: "Triangle ABC circumscribing circle r=4, BD=8, DC=6. Find AB, AC.", marks: "5M" }
                ],
                exemplar: [
                    { pattern: "Prove parallelogram circumscribing circle is a rhombus.", type: "HOTS" }
                ],
                pyqs: [
                    { pattern: "Prove tangents from external point equal.", freq: "Very High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Tangents", preferred: "Property use", variation: "Inscribed vs Circumscribed" }
                ],
                practice: [
                    { marks: "3M", questions: ["Point 13cm center, tangent 12cm, find r.", "Prove tangent ⊥ radius."] },
                    { marks: "5M", questions: ["Case Study: Circular design with four crossing tangent paths. Find total path length."] }
                ],
                tips: ["Radius ⊥ Tangent."]
            },
            {
                id: "areas-circles",
                name: "Areas Related to Circles",
                repeatedConcepts: [
                    { concept: "Sector and Segment Area", reason: "🔥 Frequently Repeated", marks: "3M / 5M" },
                ],
                ncert: [
                    { ex: "Ex 11.1 Q2", pattern: "Find area of quadrant of circle circumference 22 cm.", marks: "2M" },
                    { ex: "Ex 11.1 Q5", pattern: "Circle r=21cm, arc 60°. Find length, sector area, segment area.", marks: "5M" },
                    { ex: "Ex 11.1 Q13", pattern: "Round cover six designs r=28cm. Cost 0.35/cm². (Use √3=1.7).", marks: "5M" }
                ],
                exemplar: [
                    { pattern: "Horse tied with 5m rope in square 15m. Find grazed area.", type: "Application" }
                ],
                pyqs: [
                    { pattern: "Minute hand 14cm. Area in 5 min.", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Sector", preferred: "Formula use", variation: "Shaded region area" }
                ],
                practice: [
                    { marks: "2M", questions: ["Length of arc r=6, angle=60.", "Sector area r=4, angle=30."] },
                    { marks: "5M", questions: ["Case Study: Square 14cm with four quadrants at corners. Find shaded area."] }
                ],
                tips: ["Segment = Sector - Triangle."]
            },
            {
                id: "volumes",
                name: "Surface Areas & Volumes",
                repeatedConcepts: [
                    { concept: "Combined Solids Case Study", reason: "2026 Case Study Pattern", marks: "5M" },
                ],
                ncert: [
                    { ex: "Ex 12.1 Q1", pattern: "2 cubes joined end to end. Find surface area.", marks: "3M" },
                    { ex: "Ex 12.1 Q4", pattern: "Cube 7cm side surmounted by hemisphere. Find greatest diameter and SA.", marks: "3M" },
                    { ex: "Ex 12.2 Q3", pattern: "Gulab jamun (cylinder + 2 hemispheres) l=5, d=2.8. Syrup in 45 jamuns?", marks: "5M", diagram: `<svg viewBox="0 0 100 20" className="w-40 mx-auto"><rect x="30" y="5" width="40" height="10" stroke="currentColor" fill="none"/><path d="M30 5 Q20 10 30 15" stroke="currentColor" fill="none"/><path d="M70 5 Q80 10 70 15" stroke="currentColor" fill="none"/></svg>` }
                ],
                exemplar: [
                    { pattern: "Water 15km/h through 14cm pipe into 50x44m tank. Time for 21cm rise?", type: "HOTS" }
                ],
                pyqs: [
                    { pattern: "Melt sphere r=4.2 to cylinder r=6. Find h.", freq: "High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Volumes", preferred: "Conversion V1=V2", variation: "Additive volumes" }
                ],
                practice: [
                    { marks: "3M", questions: ["Volume of cone r=6, h=7.", "SA of sphere r=7."] },
                    { marks: "5M", questions: ["Case Study: Tent cylindrical h=2.1 d=4 + conical top s=2.8. Cost canvas at 500/m²."] }
                ],
                tips: ["Radius vs Diameter."]
            },
            {
                id: "statistics",
                name: "Statistics",
                repeatedConcepts: [
                    { concept: "Median calculation", reason: "2026 Case Study Pattern", marks: "5M" },
                ],
                ncert: [
                    { ex: "Ex 13.1 Q3", pattern: "Mean pocket allowance ₹18. Find missing f.", marks: "3M" },
                    { ex: "Ex 13.3 Q2", pattern: "Median 28.5, find x and y. Total f=60.", marks: "5M" }
                ],
                exemplar: [
                    { pattern: "Leaf median length calculation.", type: "Application" }
                ],
                pyqs: [
                    { pattern: "Calculate mode of distribution.", freq: "High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Frequency", preferred: "Cumulative freq use", variation: "Missing frequency methods" }
                ],
                practice: [
                    { marks: "3M", questions: ["Find Mean.", "Find Mode."] },
                    { marks: "5M", questions: ["Case Study: Analyzing 100 policy holders data. Find median weight."] }
                ],
                tips: ["Continuous intervals."]
            },
            {
                id: "probability",
                name: "Probability",
                repeatedConcepts: [
                    { concept: "Cards and Dice probability", reason: "🔥 Frequently Repeated", marks: "3M" },
                ],
                ncert: [
                    { ex: "Ex 14.1 Q14", pattern: "52 cards. Probability: red king, face card, red face, jack hearts...", marks: "3M" },
                    { ex: "Ex 14.1 Q24", pattern: "Die twice. Prob 5 not either / 5 at least once.", marks: "3M" }
                ],
                exemplar: [
                    { pattern: "Bad egg prob 0.035 in 400. Find number.", type: "Application" }
                ],
                pyqs: [
                    { pattern: "Sum of 8 in two dice throw.", freq: "High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Outcomes", preferred: "Favorable/Total", variation: "Complementary events" }
                ],
                practice: [
                    { marks: "1M", questions: ["P(Sure event)?", "P(not E)."] },
                    { marks: "5M", questions: ["Case Study: Spinning arrow 1-8. Prob 8, odd, >2, <9?"] }
                ],
                tips: ["Total outcomes calculation."]
            }
        ]
    },
    science: {
        icon: <Beaker size={24} />,
        color: "from-emerald-600 to-teal-700",
        chapters: [
            {
                id: "chemical-reactions",
                name: "Chemical Reactions",
                repeatedConcepts: [
                    { concept: "Types of Reactions", reason: "Direct identification", marks: "2M" },
                    { concept: "Corrosion & Rancidity", reason: "Conceptual repeaters", marks: "2M" },
                ],
                ncert: [
                    { ex: "Intxt", pattern: "Cleaning magnesium ribbon", marks: "1M" },
                    { ex: "Ex 1.1", pattern: "Identify oxidized/reduced sub.", marks: "2M" },
                ],
                exemplar: [
                    { pattern: "Electrolysis of water (Gas ratio)", type: "HOTS" }
                ],
                pyqs: [
                    { pattern: "Balanced equation for respiration", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Color changes", preferred: "Observation based", variation: "Fe nail in CuSO4" }
                ],
                practice: [
                    { marks: "2M", questions: ["What is a redox reaction? Give example.", "Why do we apply paint on iron articles?"] },
                    { marks: "5M", questions: ["Explain decomposition reaction with 3 types and examples.", "Case Study: Whitewash and shiny finish of walls."] }
                ],
                tips: ["Balance the mass on both sides.", "Mention states (s, l, aq, g)."]
            },
            {
                id: "acids-bases",
                name: "Acids, Bases & Salts",
                repeatedConcepts: [
                    { concept: "pH Scale Importance", reason: "Practical application in life", marks: "2M / 3M" },
                    { concept: "Common Salts (Baking Soda/Plaster of Paris)", reason: "Specific chemical properties", marks: "3M / 5M" },
                    { concept: "Reaction with Metals", reason: "Standard gas test (Hydrogen)", marks: "2M" },
                ],
                ncert: [
                    { ex: "Ex 2.1", pattern: "Curd in brass/copper vessels", marks: "1M" },
                    { ex: "Ex 2.3", pattern: "Plaster of Paris preparation", marks: "3M" },
                ],
                exemplar: [
                    { pattern: "Dilution of acid (Why acid to water?)", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "Uses of Bleaching Powder", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "PH values", preferred: "Acid rain/Soil PH", variation: "Antacid treatment" }
                ],
                practice: [
                    { marks: "3M", questions: ["Explain chlor-alkali process with diagram.", "What is neutralization reaction?"] },
                    { marks: "5M", questions: ["Write names, formulas and uses of 4 salts from the chapter.", "Case Study: Digestive system and PH."] }
                ],
                tips: ["Acid to Water, never Water to Acid.", "Crystallization water in POP is 1/2 H2O."]
            },
            {
                id: "metals-nonmetals",
                name: "Metals & Non-metals",
                repeatedConcepts: [
                    { concept: "Reactivity Series", reason: "Predicts displacement", marks: "2M" },
                    { concept: "Ionic Compounds Properties", reason: "Structural properties", marks: "3M" },
                    { concept: "Extraction of Metals (Roasting/Calcination)", reason: "Highly repetitive 5M", marks: "5M" },
                ],
                ncert: [
                    { ex: "Ex 3.1", pattern: "Amphoteric oxides definition", marks: "2M" },
                    { ex: "Ex 3.3", pattern: "Electron dot structures (NaCl/MgCl2)", marks: "3M" },
                ],
                exemplar: [
                    { pattern: "Thermite reaction application", type: "Application" }
                ],
                pyqs: [
                    { pattern: "Corrosion of copper and silver", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Extraction", preferred: "Comparison of Roasting/Calcination", variation: "Refining of copper" }
                ],
                practice: [
                    { marks: "2M", questions: ["Why is sodium kept in kerosene?", "Give two amphoteric oxides."] },
                    { marks: "5M", questions: ["Explain the extraction of medium reactive metals.", "Case Study: Use of alloys in daily life."] }
                ],
                tips: ["Roasting = Presence of air. Calcination = Absence of air.", "Metals lose electrons to form cations."]
            },
            {
                id: "carbon",
                name: "Carbon & its Compounds",
                repeatedConcepts: [
                    { concept: "Versatile Nature (Catenation/Tetravalency)", reason: "Basis for many compounds", marks: "2M" },
                    { concept: "Homologous Series", reason: "Identifying functional groups", marks: "2M" },
                    { concept: "Saponification & Esterification", reason: "Very common chemical tests", marks: "3M" },
                    { concept: "Soap vs Detergent", reason: "Cleansing action explanation", marks: "3M / 5M" },
                ],
                ncert: [
                    { ex: "Ex 4.1", pattern: "Dot structure of Cyclopentane/CO2", marks: "2M" },
                    { ex: "Ex 4.3", pattern: "Oxidation/Addition reactions", marks: "3M" },
                    { ex: "Ex 4.4", pattern: "Micelle formation diagram", marks: "5M" },
                ],
                exemplar: [
                    { pattern: "Structural isomers of Butane", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "Distinguish Ethanol and Ethanoic acid", freq: "High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Naming", preferred: "IUPAC for simple chains", variation: "Identify functional group" }
                ],
                practice: [
                    { marks: "3M", questions: ["Explain the cleansing action of soap with micelle diagram.", "What is hydrogenation? Practical application?"] },
                    { marks: "5M", questions: ["Describe properties and chemical tests for Ethanoic Acid.", "Case Study: Use of methane as fuel."] }
                ],
                tips: ["Draw micelle diagram clearly with hydrophilic/phobic heads.", "Memorize names of first four alkanes."]
            },
            {
                id: "life-processes",
                name: "Life Processes",
                repeatedConcepts: [
                    { concept: "Nutrition (Photosynthesis/Digestion)", reason: "Foundational biology", marks: "3M / 5M" },
                    { concept: "Respiration (Aerobic vs Anaerobic)", reason: "Energy generation focus", marks: "3M" },
                    { concept: "Transportation (Heart structure/Xylem/Phloem)", reason: "Human & Plant systems", marks: "5M" },
                    { concept: "Excretion (Nephron structure)", reason: "Classic diagram question", marks: "5M" },
                ],
                ncert: [
                    { ex: "Intxt", pattern: "Steps of Photosynthesis", marks: "3M" },
                    { ex: "Ex 5.1", pattern: "Double Circulation in humans", marks: "3M" },
                    { ex: "Ex 5.5", pattern: "Digestive enzymes functions", marks: "3M" },
                ],
                exemplar: [
                    { pattern: "Role of Alveoli/Villi (Surface area)", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "Functioning of Heart (Diagram)", freq: "Very High", marks: "5M" },
                    { pattern: "Difference between Xylem and Phloem", freq: "High", marks: "3M" }
                ],
                repeatedPatterns: [
                    { topic: "Organisms", preferred: "Nutrition in Amoeba", variation: "ATP synthesis" }
                ],
                practice: [
                    { marks: "3M", questions: ["Draw a path of air from nostrils to alveoli.", "Explain translocation in plants."] },
                    { marks: "5M", questions: ["Draw a labeled diagram of Human Excretory System and explain Nephron.", "Case Study: Exercise and heart rate."] }
                ],
                tips: ["LABEL every part of the diagram clearly.", "Focus on flowcharts for processes like digestion."]
            },
            {
                id: "control-coordination",
                name: "Control & Coordination",
                repeatedConcepts: [
                    { concept: "Reflex Arc", reason: "Immediate response logic", marks: "3M" },
                    { concept: "Brain Structure (Fore/Mid/Hind)", reason: "Functional focus", marks: "3M" },
                    { concept: "Plant Hormones (Auxin/Gibberellin)", reason: "Growth control", marks: "2M" },
                    { concept: "Human Endocrine System", reason: "Hormone table repeaters", marks: "3M / 5M" },
                ],
                ncert: [
                    { ex: "Ex 6.1", pattern: "Structure of Neuron (Diagram)", marks: "3M" },
                    { ex: "Ex 6.3", pattern: "Role of Thyroid/Adrenal glands", marks: "2M / 3M" },
                ],
                exemplar: [
                    { pattern: "Phototropism vs Geotropism", type: "Experimental" }
                ],
                pyqs: [
                    { pattern: "Hormone for blood sugar (Insulin)", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Responses", preferred: "Nervous vs Hormonal system", variation: "Synapse signal transfer" }
                ],
                practice: [
                    { marks: "3M", questions: ["Draw neuron and label Dendrite, Axon, Nerve ending.", "Explain reflex action with arc diagram."] },
                    { marks: "5M", questions: ["Explain major parts of brain and their specific functions.", "Case Study: Stress and Adrenaline response."] }
                ],
                tips: ["Signaling is electrical in neuron, chemical in synapse.", "Plants don't have a nervous system."]
            },
            {
                id: "reproduction",
                name: "How Organisms Reproduce",
                repeatedConcepts: [
                    { concept: "Asexual Methods (Fission/Budding/Regen)", reason: "Direct identification", marks: "2M / 3M" },
                    { concept: "Sexual Reproduction in Flower", reason: "Diagram + Pollination", marks: "5M" },
                    { concept: "Human Reproductive Systems", reason: "Structural & functional", marks: "5M" },
                    { concept: "Reproductive Health/Contraception", reason: "Social & biological focus", marks: "3M" },
                ],
                ncert: [
                    { ex: "Ex 7.1", pattern: "Importance of DNA copying", marks: "2M" },
                    { ex: "Intxt", pattern: "Changes in girls/boys at puberty", marks: "3M" },
                    { ex: "Ex 7.4", pattern: "Role of Placenta", marks: "3M" },
                ],
                exemplar: [
                    { pattern: "Structure of Pollen tube (Diagram)", type: "Application" }
                ],
                pyqs: [
                    { pattern: "Difference between Self and Cross pollination", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Systems", preferred: "Diagram of Female system", variation: "Tissue culture method" }
                ],
                practice: [
                    { marks: "3M", questions: ["Explain Vegetative Propagation with examples.", "Why is variation useful for species?"] },
                    { marks: "5M", questions: ["Draw and label Longitudinal section of a flower.", "Case Study: Population control methods."] }
                ],
                tips: ["Double fertilization only occurs in flowering plants.", "Contraception methods include Barrier and Chemical."]
            },
            {
                id: "heredity",
                name: "Heredity & Evolution",
                repeatedConcepts: [
                    { concept: "Mendel's Laws (Dominance/Segregation)", reason: "Foundational genetics", marks: "3M / 5M" },
                    { concept: "Monohybrid & Dihybrid Cross", reason: "Ratio calculation (3:1 / 9:3:3:1)", marks: "5M" },
                    { concept: "Sex Determination in Humans", reason: "Highly repetitive 3M", marks: "3M" },
                ],
                ncert: [
                    { ex: "Ex 8.1", pattern: "Mendelian experiment with tall/short", marks: "3M" },
                    { ex: "Ex 8.3", pattern: "Mechanism of Sex determination", marks: "3M" },
                ],
                exemplar: [
                    { pattern: "F2 generation phenotypic ratio", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "How traits are inherited? (Punnett square)", freq: "High", marks: "5M" }
                ],
                repeatedPatterns: [
                    { topic: "Crosses", preferred: "Calculation of percentage of traits", variation: "Blood grouping (if included)" }
                ],
                practice: [
                    { marks: "3M", questions: ["Explain how sex is determined in human beings.", "What is a genotype vs phenotype?"] },
                    { marks: "5M", questions: ["Describe Mendel's Dihybrid cross with 9:3:3:1 ratio.", "Case Study: Inheritance of eye color."] }
                ],
                tips: ["Always use T and t notation clearly.", "Fathere decides the sex of the child (XY)."]
            },
            {
                id: "light",
                name: "Light: Reflection & Refraction",
                repeatedConcepts: [
                    { concept: "Mirror & Lens Formulas", reason: "Core numerical base", marks: "3M" },
                    { concept: "Ray Diagrams (Concave/Convex)", reason: "Visual repeaters", marks: "3M / 5M" },
                    { concept: "Refractive Index (laws and math)", reason: "Speed of light property", marks: "2M" },
                    { concept: "Magnification (m)", reason: "Image size comparison", marks: "2M" },
                ],
                ncert: [
                    { ex: "Ex 9.1", pattern: "Finding image position (Mirror)", marks: "3M" },
                    { ex: "Ex 9.2", pattern: "Lens power calculation (P=1/f)", marks: "2M" },
                    { ex: "Intxt", pattern: "Snell's Law of refraction", marks: "2M" },
                ],
                exemplar: [
                    { pattern: "Ray path through glass slab", type: "Experimental" }
                ],
                pyqs: [
                    { pattern: "Ray diagram for obj at C (Concave)", freq: "Very High", marks: "3M" },
                    { pattern: "Define principal focus of mirror", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Numericals", preferred: "Given u and f find v and h'", variation: "Real vs Virtual image logic" }
                ],
                practice: [
                    { marks: "3M", questions: ["Ray diagram for object between Focus and Pole of concave mirror.", "Refractive index of water is 1.33. Speed of light in water?"] },
                    { marks: "5M", questions: ["Numerical on Lens: Concave lens of focal length 15cm... find v.", "Case Study: Use of mirrors in solar cookers/dentists."] }
                ],
                tips: ["Use sign convention (Cartesian) strictly.", "Mention units like 'Dioptre' for power."]
            },
            {
                id: "human-eye",
                name: "Human Eye & Color World",
                repeatedConcepts: [
                    { concept: "Power of Accommodation", reason: "Eye focus flexibility", marks: "2M" },
                    { concept: "Defects of Vision (Myopia/Hypermetropia)", reason: "Highly repetitive with diagrams", marks: "5M" },
                    { concept: "Dispersion through Prism", reason: "Spectrum formation", marks: "3M" },
                    { concept: "Atmospheric Refraction (Twinkling)", reason: "Natural phenomena", marks: "2M" },
                    { concept: "Tyndall Effect/Scattering", reason: "Blue sky/Red sunset", marks: "2M" },
                ],
                ncert: [
                    { ex: "Ex 10.1", pattern: "Myopia correction lens", marks: "3M" },
                    { ex: "Ex 10.3", pattern: "Angle of deviation in prism", marks: "3M" },
                ],
                exemplar: [
                    { pattern: "Persistence of vision", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "Why do stars twinkle?", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Defects", preferred: "Before vs After correction diagrams", variation: "Presbyopia reason" }
                ],
                practice: [
                    { marks: "3M", questions: ["Explain dispersion of white light by prism.", "Why is the color of clear sky blue?"] },
                    { marks: "5M", questions: ["Explain Myopia and its correction with ray diagrams.", "Case Study: Advanced sunrise and delayed sunset."] }
                ],
                tips: ["Correction of Myopia: Concave Lens. Hypermetropia: Convex.", "Violet deviates most, Red deviates least."]
            },
            {
                id: "electricity",
                name: "Electricity",
                repeatedConcepts: [
                    { concept: "Ohm's Law (V=IR)", reason: "Fundamental circuit law", marks: "3M" },
                    { concept: "Resistance (Series vs Parallel)", reason: "Highly repetitive numericals", marks: "5M" },
                    { concept: "Factors affecting Resistance", reason: "Material properties", marks: "2M" },
                    { concept: "Heating Effect (H=I²Rt)", reason: "Energy transformation", marks: "3M" },
                    { concept: "Electric Power (P=VI)", reason: "Efficiency and consumption", marks: "2M" },
                ],
                ncert: [
                    { ex: "Ex 11.1", pattern: "Current calculation in circuits", marks: "3M" },
                    { ex: "Ex 11.2", pattern: "Equivalent resistance in parallel", marks: "3M" },
                    { ex: "Ex 11.3", pattern: "Joule's law of heating problems", marks: "3M" },
                ],
                exemplar: [
                    { pattern: "V-I graph slope interpretation", type: "Experimental" }
                ],
                pyqs: [
                    { pattern: "Why is tungsten used in bulbs?", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Circuits", preferred: "Complex series-parallel mix", variation: "Find current in specific resistor" }
                ],
                practice: [
                    { marks: "3M", questions: ["Calculate resistance of wire of 1m, 0.3mm dia, 26 ohm resistivity.", "Advantages of parallel circuit over series."] },
                    { marks: "5M", questions: ["Derive formula for equivalent resistance in parallel.", "Case Study: Household electricity consumption (Units/Cost)."] }
                ],
                tips: ["Ammeter is always in Series, Voltmeter in Parallel.", "Unit of Resistivity is Ω-m."]
            },
            {
                id: "magnetic-effects",
                name: "Magnetic Effects of Current",
                repeatedConcepts: [
                    { concept: "Magnetic Field Lines (Properties)", reason: "Basic visual representation", marks: "2M" },
                    { concept: "Right Hand Thumb Rule", reason: "Direction indication", marks: "2M" },
                    { concept: "Solenoid properties", reason: "Standard electromagnet", marks: "3M" },
                    { concept: "Fleming's Left Hand Rule", reason: "Force on conductor", marks: "3M" },
                    { concept: "Domestic Electric Circuits (Earthing/Fuse)", reason: "Safety focus", marks: "3M" },
                ],
                ncert: [
                    { ex: "Ex 12.1", pattern: "Field due to current in loop", marks: "3M" },
                    { ex: "Ex 12.3", pattern: "Role of split rings in DC motor (if in syllabus)", marks: "3M" },
                ],
                exemplar: [
                    { pattern: "Deflection of compass needle", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "Function of Fuse in domestic circuit", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Fields", preferred: "Comparison of Bar vs Solenoid", variation: "Strength of electromagnet" }
                ],
                practice: [
                    { marks: "3M", questions: ["State Fleming's Left Hand Rule.", "Why don't magnetic field lines cross each other?"] },
                    { marks: "5M", questions: ["Explain domestic electric circuit with Earthing and Fuse.", "Case Study: Working of an electric bell/motor."] }
                ],
                tips: ["Field inside a solenoid is uniform.", "Use the correct hand! Left for Force, Right for Direction."]
            },
            {
                id: "environment",
                name: "Our Environment",
                repeatedConcepts: [
                    { concept: "Ecosystem (Biotic/Abiotic)", reason: "Structural components", marks: "1M" },
                    { concept: "Food Chain & Food Web", reason: "Energy flow", marks: "2M" },
                    { concept: "10% Law of Energy", reason: "Trophic levels logic", marks: "3M" },
                    { concept: "Ozone Depletion (CFCs)", reason: "Environmental issue", marks: "2M" },
                    { concept: "Waste Management (Biodegeadable)", reason: "Sustainability focus", marks: "2M" },
                ],
                ncert: [
                    { ex: "Ex 13.1", pattern: "Magnification of chemicals (Biomagnification)", marks: "2M" },
                    { ex: "Ex 13.2", pattern: "Trophic levels pyramid", marks: "2M" },
                ],
                exemplar: [
                    { pattern: "Global warming vs Greenhouse effect", type: "Conceptual" }
                ],
                pyqs: [
                    { pattern: "How is Ozone formed in atmosphere?", freq: "High", marks: "2M" }
                ],
                repeatedPatterns: [
                    { topic: "Energy Flow", preferred: "Unidirectional flow reasoning", variation: "Accumulation of DDT" }
                ],
                practice: [
                    { marks: "2M", questions: ["What will happen if we kill all organisms in one trophic level?", "Role of decomposers?"] },
                    { marks: "5M", questions: ["Explain Biological Magnification and its impact on top consumers.", "Case Study: Managing the garbage we produce."] }
                ],
                tips: ["Energy flow is UNIDIRECTIONAL.", "Decomposers help in nutrient recycling."]
            }
        ]
    }
};

function BoardReady({ isClass9: isClass9Prop = false }) {
    const userData = useSelector((state) => state.auth.userData);
    const location = useLocation();
    const navigate = useNavigate();

    const isClass9 = isClass9Prop || location.pathname.includes("exam-ready");
    const data = isClass9 ? examReadyData : boardReadyData;
    const [selectedSubject, setSelectedSubject] = useState("maths");
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [viewMode, setViewMode] = useState("chapters"); // "chapters" or "details"
    const [activePracticeTab, setActivePracticeTab] = useState(0);
    const [activeCategory, setActiveCategory] = useState("ncert");

    const classYear = isClass9 ? 9 : (userData?.class || 10);
    const currentSubjectData = data[selectedSubject];
    const chapters = currentSubjectData?.chapters || [];

    const handleChapterSelect = (chapterId) => {
        const chapter = chapters.find(c => c.id === chapterId);
        setSelectedChapter(chapter);
        setViewMode("details");
        setActivePracticeTab(0);
        setActiveCategory("ncert");
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        if (viewMode === "details") {
            setViewMode("chapters");
            setSelectedChapter(null);
        } else {
            navigate("/");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#0b162b] transition-colors duration-500">
            <Helmet>
                <title>{isClass9 ? "Exam Ready" : "Board Ready"} | Sarvottam Institute</title>
                <meta name="description" content={isClass9 ? "Class 9th Exam Preparation Hub - Become Exam Ready" : "CBSE Exam Preparation Hub - Become Board Ready"} />
            </Helmet>

            <Sidebar />

            <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8 py-8 md:py-10 ml-0 lg:ml-[100px] pt-20 lg:pt-8 min-h-screen">

                {/* 1. Header & Subject Selection (Interactivity Point 1) */}
                <div className="mb-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="p-2.5 bg-white dark:bg-slate-900/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary transition-all group"
                            >
                                <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter flex items-center gap-3">
                                    {viewMode === "details" ? selectedChapter?.name : (isClass9 ? "Exam Ready" : "Board Ready")}
                                    <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-widest animate-pulse border border-primary/20">{isClass9 ? "Class 9th" : "CBSE 2025"}</span>
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-2">
                                    <Target size={16} className="text-primary" />
                                    {viewMode === "details" ? "Exam Blueprint & Practice" : (isClass9 ? "Your personal class 9th exam architect" : "Your personal board exam architect")}
                                </p>
                            </div>
                        </div>

                        {viewMode === "chapters" && (
                            <div className="flex bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <button
                                    onClick={() => setSelectedSubject("maths")}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 ${selectedSubject === "maths" ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-y-[-2px]' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    <Calculator size={18} /> Maths
                                </button>
                                <button
                                    onClick={() => setSelectedSubject("science")}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 ${selectedSubject === "science" ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 translate-y-[-2px]' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    <Beaker size={18} /> Science
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Main Content View */}
                {viewMode === "chapters" ? (
                    <div className="flex flex-col 2xl:flex-row gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex-1 space-y-12">
                            {/* Interactive Hero Instruction */}
                            {/* Interactive Hero Instruction */}
                            <div className={`p-10 rounded-[48px] bg-gradient-to-br ${currentSubjectData.color} text-white shadow-2xl relative overflow-hidden group`}>
                                <div className="absolute top-0 right-0 p-40 bg-white/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
                                <div className="absolute bottom-0 left-0 p-32 bg-black/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform duration-1000"></div>

                                <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
                                    <div className="space-y-6 max-w-xl text-center xl:text-left">
                                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
                                            <Award size={14} className="text-yellow-400" /> Premium Exam Architect
                                        </div>
                                        <h2 className="text-5xl md:text-6xl font-black leading-tight tracking-tighter">
                                            Become <br />{isClass9 ? "Exam" : "Board"} Ready.
                                        </h2>
                                        <p className="text-white/80 font-medium text-lg leading-relaxed max-w-md mx-auto xl:mx-0">
                                            Unlock the expert blueprint, past paper analysis, and marks-specific practice curated by {isClass9 ? "subject teachers" : "board examiners"}.
                                        </p>
                                        <div className="flex flex-wrap justify-center xl:justify-start gap-4 pt-4">
                                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30 text-xs font-black uppercase tracking-widest shadow-xl shadow-black/5 hover:bg-white hover:text-black transition-all cursor-default">
                                                <CheckCircle2 size={16} /> 100% NCERT
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30 text-xs font-black uppercase tracking-widest shadow-xl shadow-black/5 hover:bg-white hover:text-black transition-all cursor-default">
                                                <Star size={16} /> 10yr PYQ
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-6 shrink-0 w-full xl:w-auto">
                                        {/* Board Countdown Card */}
                                        <div className="flex-1 xl:w-64 bg-white/10 backdrop-blur-2xl p-8 rounded-[40px] border border-white/20 shadow-2xl relative overflow-hidden group/card text-center">
                                            <div className="absolute top-0 right-0 p-12 bg-white/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                            <div className="relative z-10">
                                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ring-1 ring-white/30">
                                                    <Timer size={32} className="text-white animate-pulse" />
                                                </div>
                                                <span className="block font-black text-4xl mb-1 tracking-tighter">{isClass9 ? "Finals" : "32 Days"}</span>
                                                <span className="text-white/60 font-black uppercase tracking-[0.2em] text-[10px]">{isClass9 ? "Approaching Soon" : "Left for Boards"}</span>
                                                <div className="mt-6 pt-6 border-t border-white/10">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-black uppercase opacity-60">Syllabus Covered</span>
                                                        <span className="text-[10px] font-black uppercase">74%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-white rounded-full w-[74%]"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Goal Card */}
                                        <div className="flex-1 xl:w-64 bg-white/10 backdrop-blur-2xl p-8 rounded-[40px] border border-white/20 shadow-2xl relative overflow-hidden group/card text-center hover:translate-y-[-5px] transition-transform duration-500">
                                            <div className="absolute bottom-0 left-0 p-12 bg-black/10 blur-3xl rounded-full translate-x-1/2 translate-y-1/2"></div>
                                            <div className="relative z-10">
                                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ring-1 ring-white/30">
                                                    <Target size={32} className="text-white" />
                                                </div>
                                                <span className="block font-black text-4xl mb-1 tracking-tighter">95+ Goal</span>
                                                <span className="text-white/60 font-black uppercase tracking-[0.2em] text-[10px]">Standard Ready</span>
                                                <div className="mt-6">
                                                    <button className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-lg">
                                                        Analyze Prep
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chapter Selection Grid (Interactivity Point 2) */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                    <Layout size={20} className="text-primary" /> Select Chapter
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {chapters.map((chapter) => (
                                        <div
                                            key={chapter.id}
                                            onClick={() => handleChapterSelect(chapter.id)}
                                            className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:border-primary hover:translate-y-[-8px] transition-all duration-500 group cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                                            <div className="flex justify-between items-start mb-8">
                                                <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:rotate-[15deg] transition-all duration-500">
                                                    {currentSubjectData.icon}
                                                </div>
                                                <div className="flex -space-x-2">
                                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black">PYQ</div>
                                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 flex items-center justify-center text-white text-[10px] font-black">SOL</div>
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter group-hover:text-primary transition-colors">{chapter.name}</h3>
                                            <p className="text-slate-400 text-sm font-medium">Expert analysis & practice available</p>

                                            <div className="mt-8 flex items-center justify-between text-primary font-black text-xs uppercase tracking-widest">
                                                <span>Explore Content</span>
                                                <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar: Personal Prep Analytics (UTILIZING THE RED AREA) */}
                        <div className="hidden 2xl:block w-[380px] shrink-0 space-y-8 animate-in fade-in slide-in-from-right-10 duration-1000">
                            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 shadow-xl sticky top-8">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter text-sm">Level Analytics</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Personal Performance</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Preparation Score</span>
                                        <div className="flex items-end gap-2 mb-4">
                                            <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">840</span>
                                            <span className="text-primary font-black mb-1">XP</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full w-[65%]"></div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 mt-4 text-center">Top 15% of students this week</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Board Ready Checklist</h5>
                                        {[
                                            { label: "Formula Mastery", status: "80%" },
                                            { label: "PYQ Deciphering", status: "45%" },
                                            { label: "Mock Attempted", status: "12" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.label}</span>
                                                <span className="text-xs font-black text-primary">{item.status}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6">
                                        <button className="w-full py-4 bg-slate-900 dark:bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl">
                                            Download Blueprint PDF
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-12 p-6 bg-primary/5 rounded-[32px] border border-primary/20 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <HelpCircle className="text-primary mb-4" />
                                        <h5 className="font-black text-sm uppercase mb-2">{isClass9 ? "Learning" : "Expert"} Hotline</h5>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Unclear about a pattern? Ask our {isClass9 ? "teachers" : "board specialists"} directly.</p>
                                        <button className="text-[10px] font-black text-primary uppercase tracking-widest border-b-2 border-primary pb-1 group-hover:gap-2 flex items-center transition-all">Start Chat</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700 pb-32">
                        {/* 0. Navigation Breadcrumbs */}
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setSelectedChapter(null)}
                                className="px-4 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-500 hover:text-primary transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                            >
                                <ArrowLeft size={16} /> Back to Chapters
                            </button>
                            <div className="px-6 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-slate-700 dark:text-white font-black text-xs uppercase tracking-widest shadow-sm">
                                <Target size={16} className="text-primary" /> {selectedChapter?.name}
                            </div>
                        </div>

                        {/* Category Selector Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { id: "ncert", label: "NCERT Questions", icon: <BookOpen size={20} />, color: "blue", desc: "Foundational repeaters" },
                                { id: "exemplar", label: "Exemplar Problems", icon: <Layout size={20} />, color: "emerald", desc: "HOTs & Conceptual" },
                                { id: "practice", label: "Exam Practice", icon: <Award size={20} />, color: "primary", desc: "PYQs & Marks-wise" },
                                { id: "patterns", label: "Repeated Patterns", icon: <Activity size={20} />, color: "slate", desc: "Analysis & Varients" }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`p-6 rounded-3xl border transition-all duration-500 text-left group relative overflow-hidden ${activeCategory === cat.id
                                        ? `bg-white dark:bg-slate-900 border-${cat.color === 'primary' ? 'primary' : cat.color + '-500'} shadow-2xl scale-[1.02] ring-2 ring-${cat.color === 'primary' ? 'primary' : cat.color + '-500'}/20`
                                        : 'bg-white/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 hover:border-primary/50'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${activeCategory === cat.id
                                        ? `bg-${cat.color === 'primary' ? 'primary' : cat.color + '-600'} text-white shadow-lg`
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-primary'}`}>
                                        {cat.icon}
                                    </div>
                                    <h4 className={`font-black text-sm uppercase tracking-tight mb-1 ${activeCategory === cat.id ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>{cat.label}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.desc}</p>

                                    {activeCategory === cat.id && (
                                        <div className={`absolute bottom-0 right-0 w-16 h-16 bg-${cat.color === 'primary' ? 'primary' : cat.color + '-500'}/10 rounded-tl-full`}></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content Area - Dynamically rendered based on activeCategory */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeCategory === "ncert" && (
                                <section className="bg-white dark:bg-slate-900/40 rounded-[40px] border border-slate-200 dark:border-slate-800/50 overflow-hidden shadow-2xl">
                                    <div className="p-8 md:p-12">
                                        <div className="grid grid-cols-1 gap-8">
                                            {selectedChapter?.ncert.map((item, idx) => (
                                                <div key={idx} className="p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-[32px] border border-slate-100 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 group transition-all duration-500">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <span className="text-[10px] font-black px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-colors">{item.ex}</span>
                                                        <span className="text-sm font-black text-slate-300 dark:text-slate-700">#0{idx + 1}</span>
                                                    </div>
                                                    <h4 className="text-lg font-black text-slate-800 dark:text-white leading-snug mb-6 group-hover:text-blue-600 transition-colors">
                                                        {item.pattern}
                                                    </h4>

                                                    <div className="flex flex-col md:flex-row gap-10 items-center">
                                                        {item.diagram && (
                                                            <div
                                                                className="w-full md:w-auto p-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 flex justify-center shadow-inner shrink-0"
                                                                dangerouslySetInnerHTML={{ __html: item.diagram }}
                                                            />
                                                        )}

                                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                                            <Target size={12} className="text-blue-500" /> Expected: {item.marks}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {activeCategory === "exemplar" && (
                                <section className="bg-white dark:bg-slate-900/40 rounded-[40px] border border-slate-200 dark:border-slate-800/50 overflow-hidden shadow-2xl">
                                    <div className="p-8 md:p-12">
                                        <div className="grid grid-cols-1 gap-8">
                                            {selectedChapter?.exemplar.map((item, idx) => (
                                                <div key={idx} className="p-8 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-[32px] border border-emerald-100/50 dark:border-emerald-900/20 hover:bg-white dark:hover:bg-slate-800 group transition-all duration-500">
                                                    <div className="flex items-start gap-6">
                                                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center font-black text-emerald-500 shadow-sm shrink-0 uppercase text-[10px] tracking-widest">HOTs</div>
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-black text-slate-800 dark:text-white mb-3 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{item.pattern}</h4>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-lg">{item.type}</span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Zap size={12} className="text-amber-500" /> Critical</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {activeCategory === "practice" && (
                                <section className="bg-slate-900 dark:bg-slate-900 rounded-[48px] border border-slate-800 overflow-hidden shadow-2xl relative">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="p-8 md:p-14 relative z-10">
                                        <div className="flex justify-end mb-8">
                                            <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                                                {selectedChapter?.practice.map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setActivePracticeTab(idx)}
                                                        className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activePracticeTab === idx ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}
                                                    >
                                                        {item.marks}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                            {/* PYQs Sub-section */}
                                            <div className="space-y-6">
                                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Board History (PYQs)</h5>
                                                {selectedChapter?.pyqs.map((item, idx) => (
                                                    <div key={idx} className="p-6 bg-white/5 rounded-[32px] border border-white/10 group hover:border-primary/50 transition-all">
                                                        <div className="flex gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black text-white group-hover:bg-primary transition-all uppercase">Q{idx + 1}</div>
                                                            <div className="flex-1">
                                                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                                                    {item.diagram && (
                                                                        <div
                                                                            className="w-full md:w-auto p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-center shadow-inner shrink-0"
                                                                            dangerouslySetInnerHTML={{ __html: item.diagram }}
                                                                        />
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <p className="text-md font-bold text-white mb-3 leading-snug">{item.pattern}</p>
                                                                        <div className="flex gap-4">
                                                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest border border-white/10 px-2 py-1 rounded-md">Rank: {item.freq}</span>
                                                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest border border-primary/20 px-2 py-1 rounded-md">{item.marks} Marks</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Category Practice Sub-section */}
                                            <div className="space-y-6">
                                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Curated Practice ({selectedChapter?.practice?.[activePracticeTab]?.marks})</h5>
                                                <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 space-y-8">
                                                    {selectedChapter?.practice?.[activePracticeTab]?.questions?.map((q, i) => (
                                                        <div key={i} className="flex gap-6 group">
                                                            <div className="text-primary font-black text-xs shrink-0 mt-1">0{i + 1}.</div>
                                                            <div className="flex-1 flex flex-col md:flex-row gap-6 items-center">
                                                                {q.diagram && (
                                                                    <div
                                                                        className="w-full md:w-auto p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-center shadow-inner shrink-0"
                                                                        dangerouslySetInnerHTML={{ __html: q.diagram }}
                                                                    />
                                                                )}
                                                                <p className="text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">{q.text || q}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform mt-4">
                                                        Master Solution Logic
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {activeCategory === "patterns" && (
                                <section className="bg-white dark:bg-slate-900/40 rounded-[40px] border border-slate-200 dark:border-slate-800/50 overflow-hidden shadow-2xl">
                                    <div className="p-8 md:p-12">
                                        <div className="grid grid-cols-1 gap-8">
                                            {selectedChapter?.repeatedPatterns.map((item, idx) => (
                                                <div key={idx} className="p-8 bg-slate-50/50 dark:bg-slate-800/20 rounded-[40px] border border-slate-100 dark:border-slate-800/50 hover:border-primary group transition-all">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{item.topic}</h4>
                                                        <Zap size={16} className="text-amber-500 animate-pulse" />
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div>
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Standard Format</span>
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.preferred}</p>
                                                        </div>
                                                        <div className="p-4 bg-primary/5 dark:bg-primary/20 rounded-2xl border border-primary/10">
                                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 block">Expected Variation</span>
                                                            <p className="text-xs font-black text-primary/80 italic">{item.variation}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Chapter Tips */}
                        <div className="p-10 bg-amber-50 dark:bg-amber-900/10 rounded-[48px] border border-amber-200/50 dark:border-amber-800/30 flex flex-col md:flex-row items-center gap-10">
                            <div className="shrink-0 text-center md:text-left">
                                <h3 className="text-xl font-black text-amber-800 dark:text-amber-500 uppercase tracking-tighter mb-2 flex items-center justify-center md:justify-start gap-3">
                                    <Layout size={24} /> {isClass9 ? "Exam" : "Board"} Master Tips
                                </h3>
                                <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest">Writing style & approach</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                {selectedChapter?.tips.map((tip, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                                        <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic">"{tip}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BoardReady;
