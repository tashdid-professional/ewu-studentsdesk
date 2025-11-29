# 📚 EWU Course List Update Guide

## 🎯 Overview
This guide shows you how to update your EWU Course Planner with new faculty/course data from CSV files.

## 📋 Prerequisites
- Node.js installed
- `papaparse` package installed (`npm install papaparse`)
- New faculty CSV file from EWU

## 🔄 Step-by-Step Update Process

### Step 1: Prepare Your New CSV
1. **Download** the new faculty list CSV from EWU
2. **Rename** it to `faculty_list_spring.csv` (or update the semester name)
3. **Place** it in the `public/` folder

### Step 2: Clean the CSV
```bash
# Run the CSV cleaning script
node remove-room-from-csv.js
```

**What this does:**
- ✅ Removes room numbers and locations
- ✅ Handles multi-line quoted entries
- ✅ Extracts only: Course, Section, Faculty, Capacity, Timing
- ✅ Creates `faculty_list_spring-cleaned.csv`

### Step 3: Generate Course Data
```bash
# Convert cleaned CSV to JavaScript format
node generate-courses-data.js
```

**What this does:**
- ✅ Groups courses by code and section
- ✅ Combines multiple time slots per section
- ✅ Joins multiple faculty with " & "
- ✅ Creates `courses-data-updated.js`

### Step 4: Update Your App
**Option A: Replace existing data**
```bash
# Rename the new file to replace current data
# courses-data-updated.js → courses-data-new.js
```

**Option B: Update import (Recommended)**
Edit `components/course-planner.js`:
```javascript
// Change this line:
import { courses } from "../public/courses-data-new";
// To:
import { courses } from "../public/courses-data-updated";
```

### Step 5: Test Your Application
```bash
# Start development server
npm run dev

# Check:
# ✅ Courses load correctly
# ✅ Search functionality works
# ✅ Faculty names display properly
# ✅ Time slots show completely
```

## 📁 File Structure

```
ewu-helpdesk/
├── 🔧 Scripts
│   ├── remove-room-from-csv.js     # Step 2: Clean CSV
│   └── generate-courses-data.js    # Step 3: Generate data
├── 📊 Data (public/)
│   ├── faculty_list_spring.csv         # Step 1: Your new CSV
│   ├── faculty_list_spring-cleaned.csv # Step 2: Cleaned output
│   ├── courses-data-updated.js         # Step 3: Generated data
│   └── courses-data-new.js             # Current active data
└── 🎨 App
    └── components/course-planner.js    # Step 4: Update import
```

## 🛠️ Troubleshooting

### "Header row not found"
- Check that your CSV has proper headers
- Ensure first row contains: `Course,Section,Faculty,Capacity,Timing`

### "Missing time slots"
- Verify the CSV cleaning script ran successfully
- Check for quoted multi-line entries in original CSV

### "No courses showing"
- Confirm the import path in `course-planner.js`
- Check browser console for JavaScript errors

### "Faculty names missing"
- Ensure CSV has faculty data in correct column
- Check for empty faculty fields in source data

## 💡 Tips for Different Semesters

### For Spring Semester:
- Use `faculty_list_spring.csv`
- Update semester display in `course-planner.js`:
  ```javascript
  Current List: <span>Spring-26</span>
  ```

### For Fall/Summer Semesters:
1. **Update filenames** in both scripts:
   ```javascript
   // In remove-room-from-csv.js and generate-courses-data.js
   const inputPath = 'public/faculty_list_fall.csv';
   ```
2. **Update semester display** in the app

## 📞 Need Help?

**Common Issues:**
- CSV format changes → Update regex patterns in cleaning script
- New column structure → Adjust parsing logic
- Missing courses → Check CSV data integrity

**Quick Test:**
```bash
# Check if scripts work with sample data
node remove-room-from-csv.js
node generate-courses-data.js
```

---
**Last Updated:** November 29, 2025  
**Version:** Spring 2025 Compatible  
**Maintainer:** EWU Helpdesk Team