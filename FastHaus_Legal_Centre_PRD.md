# FastHaus Legal Centre PRD

## Document Information

-   **Project:** FastHaus Website
-   **Feature:** Legal Centre
-   **Owner:** FastHaus
-   **Status:** Ready for Development

------------------------------------------------------------------------

# 1. Objective

Build a reusable documentation-style Legal Centre that houses all legal
policies using a single layout and shared components. The experience
should match the premium FastHaus brand and make legal content easy to
navigate, maintain and extend.

------------------------------------------------------------------------

# 2. Pages

-   Terms & Conditions
-   Privacy Policy
-   Refund & Returns Policy
-   Shipping Policy
-   Warranty Policy
-   Cookie Policy

All pages must use the same `LegalLayout` component.

------------------------------------------------------------------------

# 3. Success Criteria

-   Single reusable layout
-   Mobile-first responsive design
-   Accessible (WCAG 2.2 AA)
-   SEO friendly
-   Easy for non-developers to update content
-   Automatic table of contents
-   Excellent readability

------------------------------------------------------------------------

# 4. Information Architecture

Home └── Legal ├── Terms & Conditions ├── Privacy Policy ├── Refund &
Returns ├── Shipping ├── Warranty └── Cookie Policy

------------------------------------------------------------------------

# 5. Layout

Desktop: - Max container: 1280px - Sidebar: 240px (sticky) - Content:
780px - Gap: 64px

Mobile: - Single column - Collapsible "On this page" navigation

------------------------------------------------------------------------

# 6. Shared Components

## Hero

Contains: - Page title - Short description - Last updated date

## Sticky Table of Contents

Automatically generated from H2 headings. Highlight active section while
scrolling.

## Summary Cards

Reusable cards for quick facts.

## Callouts

Variants: - Info - Success - Warning - Important

## Accordion

Used for lengthy sections such as refund eligibility or warranty
exclusions. ( Use the shadcn accordian npx shadcn@latest add accordion)

## Related Policies

Display 3--4 related policy cards at the bottom of every page.

## Contact Card

Displays support email and business hours.

(hello@fasthaus.studio) / (10AM to 7PM | Monday to Saturday)
------------------------------------------------------------------------

# 7. Icons (Lucide)

  Section                 Icon
  ----------------------- -------------
  Introduction            BookOpen
  About                   House
  Products                Package
  Made to Order           Hammer
  Custom Orders           Palette
  Payment                 CreditCard
  Shipping                Truck
  Returns                 RotateCcw
  Warranty                ShieldCheck
  Product Care            Lightbulb
  Privacy                 Lock
  Cookies                 Cookie
  Analytics               ChartColumn
  Contact                 Mail
  Legal                   Scale
  Intellectual Property   Copyright

------------------------------------------------------------------------

# 8. Typography

H1: 48px / 700

H2: 32px / 700

H3: 24px / 600

Body: 18px / 1.75

Small: 14px

------------------------------------------------------------------------

# 9. Colours

Background: #FAFAF9

Cards: #FFFFFF

Border: #E7E5E4

Primary Text: #111827

Secondary Text: #6B7280

Accent: Use FastHaus brand accent token.

------------------------------------------------------------------------

# 10. Motion

-   Smooth scrolling (300ms)
-   Active TOC highlight
-   Accordion animation (250ms)
-   Card hover elevation (2px)
-   Link underline animation

------------------------------------------------------------------------

# 11. SEO

Every page must include: - Unique title - Meta description - Open Graph
image - Canonical URL - Breadcrumbs - Structured data (WebPage) - Proper
H1-H3 hierarchy

------------------------------------------------------------------------

# 12. Accessibility

-   WCAG 2.2 AA
-   Keyboard navigation
-   Visible focus states
-   ARIA labels
-   Colour contrast compliant
-   Screen-reader friendly table of contents

------------------------------------------------------------------------

# 13. Technical Requirements

-   Build a reusable `LegalLayout` component.
-   Render policy content from Markdown or CMS.
-   Auto-generate sidebar navigation from headings.
-   Support deep-linking to sections.
-   Print-friendly styles.
-   Automatic "Last Updated" metadata.
-   Lazy-load only page content; layout remains shared.

------------------------------------------------------------------------

# 14. Acceptance Criteria

-   All six legal pages implemented.
-   Consistent layout across all pages.
-   Responsive behaviour verified.
-   SEO metadata implemented.
-   Accessibility audit passes.
-   Lighthouse accessibility score ≥95.
-   No duplicated layout code across pages.

------------------------------------------------------------------------

# 15. Future Enhancements

-   Version history for policies.
-   Search within legal pages.
-   Download as PDF.
-   Multi-language support.
-   CMS editor for legal content.
