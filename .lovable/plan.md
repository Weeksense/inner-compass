

## Fix: Review Calendar Not Showing Filled Dots

### Problem
The heatmap generates 52 dates by subtracting `i * 7` days from **today's date**. For example, if today is a Tuesday, all 52 generated dates will be Tuesdays. But `week_start_date` in the database is always set to the **Monday** of that week (set in `Review.tsx`). Since "2026-02-24" (Tuesday) never equals "2026-02-23" (Monday), the dots never light up.

### Solution
Adjust `getHeatmapWeeks()` so that each generated date snaps to the **Monday** of that week before comparing. This way the heatmap dates will match the stored `week_start_date` values.

### Technical Detail

**File: `src/pages/Dashboard.tsx`** -- Update `getHeatmapWeeks()`:

- For each of the 52 weeks, calculate the date, then normalize it to the Monday of that week (same logic used elsewhere in the file for `thisWeekStart`)
- Compare the resulting Monday ISO string against `week_start_date`

This is a ~3-line change inside the existing loop in `getHeatmapWeeks`.

