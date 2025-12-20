---
description: Guidelines for creating and updating chapter notes HTML files
---

# Chapter Notes Structure Guidelines

When updating or creating new chapter notes (Physics, Biology, Chemistry), follow these strict structural rules:

## 1. File Structure
- **Main Theory File**: `Chapter-X-TopicName.html` (e.g., `Chapter-11-Electricity.html`)
- **Activities File**: `Chapter-X-Activities.html` (e.g., `Chapter-11-Activities.html`)

## 2. Main Theory File (`Chapter-X-TopicName.html`)

### Hero Section
- Must include **Title**, **Subtitle**, and **Badges**.
- **CRITICAL**: Must include a **"View Activities" button** linking to the activities file.
```html
<div class="hero-actions">
    <a href="Chapter-X-Activities.html" class="btn btn-primary">View Activities & Experiments &rarr;</a>
</div>
```

### Content Styling
- Use **Dark Theme** with specific accent colors per subject/chapter.
- Use `card` class for content blocks.
- Use `formula-box` for mathematical formulas.
- Use `diagram-box` for images.
- Use `lightbox` script for image zooming.

### Bottom Navigation
- The file **MUST** end with a dedicated **"NCERT Lab" / Activities Link section**.
- Do **NOT** include full activity details here. Only a summary link.
- Use the `hero-card` style for this bottom section.

```html
<section id="ncert-activities">
    <span class="section-label">NCERT Lab</span>
    <div class="section-title-row">
        <h2>Key Activities</h2>
    </div>
    <div class="hero-card">
        <!-- content -->
        <a href="Chapter-X-Activities.html" class="btn btn-primary">Explore All Activities &rarr;</a>
    </div>
</section>
```

## 3. Activities File (`Chapter-X-Activities.html`)

- **Back Link**: Include a `← Back to Notes` link at the top.
- **Structure**: List activities using `.activity-card`.
- **Content**: Each activity must have:
  - Badge (Activity X.X)
  - Title
  - Aim
  - Procedure (ol/ul)
  - Observation (`.observation-box`)
  - Conclusion

## 4. CSS Variables
- Use a root variable system for colors to allow easy theming (Cyan, Emerald, etc.).
- Ensure `lightbox` CSS and JS are included in both files (or at least the main file if images are present).
