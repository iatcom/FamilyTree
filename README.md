# Family Tree Application

A user-friendly, interactive family tree visualization application that displays family relationships, calculates ages, and handles complex family structures with different relationship types.

## Features

- **Interactive Tree Visualization** - Click on any family member to view their relationships
- **URL-Based Navigation** - Share family member links (e.g., `http://localhost:8000/#mihai_i`) that automatically load and display that person
- **Search Functionality** - Live search to quickly find family members by name
- **Collapsible Legend** - Toggle the legend on/off for better mobile viewing
- **Relationship Types** - Displays married, partners, and unknown relationship types with different visual indicators
- **Age Calculation** - Automatically calculates current age or age at death
- **Ancestor/Descendant View** - Shows up to 10 generations of ancestors and 4 generations of descendants
- **Visual Relationship Lines** - SVG lines connect family members with different styles for each relationship type
- **Mobile-Optimized** - Fully responsive design with touch-friendly interface and optimized controls for all devices
- **Privacy-Focused** - Displays only first names with family initial (e.g., "Mihai I.") and birth years

## Project Structure

```
FamilyTree/
├── index.html          # Main HTML file with SVG canvas and tree container
├── styles.css          # CSS styling for person cards, legend, and responsive design
├── app.js              # JavaScript logic for tree rendering and data management
├── data.json           # Family data including people and relationships
└── README.md           # This file
```

## How to Use

### Option 1: Direct File Opening (Simplest)
1. Navigate to the project folder
2. Double-click `index.html` to open in your browser
3. Click on any person to view their family tree
4. Use the search box to find specific family members
5. Click the legend button to toggle the relationship legend on/off

### Option 2: Local Web Server (Recommended)
```powershell
cd d:\FamilyTree
python -m http.server 8000
```
Then open your browser to: `http://localhost:8000`

### Sharing a Link
When you click on a person, the URL updates automatically. You can copy this link (e.g., `http://localhost:8000/#mihai_i`) and share it with others - they will see that same person's family tree when they open it.

## Data Structure

### People
```json
{
  "id": "person_id",
  "name": "First Name I.",
  "gender": "M|F|U",
  "birth": "1997",
  "death": "2020",           // optional
  "additionalInfo": "Extra info"  // optional
}
```

### Relationships (Unions)
```json
{
  "id": "u1",
  "partner1": "person_id_1",
  "partner2": "person_id_2",
  "type": "married|partners|unknown",
  "children": ["child_id_1", "child_id_2"]
}
```

## Understanding the Legend

| Line Style | Meaning |
|-----------|---------|
| Solid green line | Married couple |
| Dashed yellow line | Partners (unmarried) |
| Dotted gray line | Unknown/single parent |
| Purple curved line | Parent-child relationship |

## Features Explained

### Age Calculation
- **Living people**: Shows "Born: 1997 (28 years)"
- **Deceased people**: Shows "1937 - 2003 (lived 66 years)"

### Interactive Navigation
- Click on any person's card to make them the center of the tree
- The tree automatically redraws showing their relationships
- Spouse cards are highlighted in blue
- Selected person is highlighted in green

### Responsive Lines
- Relationship lines automatically update when you scroll or resize the window
- Lines stay connected to the correct family members

## Files Description

### index.html
- Loads the legend showing relationship types
- Creates SVG canvas for drawing relationship lines
- Includes tree container where family members are displayed
- Links to CSS and JavaScript files

### styles.css
- Styles for person cards with hover effects
- Legend styling
- SVG line styles for each relationship type
- Responsive design for mobile devices
- Color-coded union bars (married, partners, unknown)

### app.js
- Data loading and initialization with hash-based URL routing
- Tree rendering logic with person and union selection
- SVG line drawing for relationships with automatic resizing
- Age calculation functions
- Ancestor and descendant retrieval (up to 10 ancestors, 4 descendants)
- Search functionality with live results
- Legend toggle for mobile-friendly interface
- Event listeners for interactive features and URL navigation
- Current person display in sticky header

### data.json
- JSON database with all family members and their relationships
- Privacy-focused: shows only first name + family initial
- Birth years and optional death years
- Flexible for adding additional information

## Adding New Family Members

1. Add a person to the `people` object in `data.json`:
```json
"new_person": {
  "id": "new_person",
  "name": "FirstName I.",
  "gender": "M",
  "birth": "1980"
}
```

2. Create a union (relationship) in the `unions` array:
```json
{
  "id": "u11",
  "partner1": "new_person",
  "partner2": "existing_person",
  "type": "married",
  "children": []
}
```

3. If they have children, add their IDs to the `children` array of the union.

## Privacy & Security

This application is designed with privacy in mind:
- **Names**: Only first name + family initial displayed
- **Dates**: Only birth year shown (not full date)
- **Optional death year**: Add to mark deceased family members

### Sensitive Information to Avoid
- Full birth dates (day + month)
- Phone numbers or email addresses
- Full addresses
- Medical or health information
- Financial information

## Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6 support

## Future Enhancements

- Increase/decrease ancestor or descendant depth
- Zoom and pan controls for large trees
- Swipe navigation for mobile devices
- Dark mode
- Filter by generation or age range
- Photo/avatar integration

## License

Personal/Family use

## Contact

For questions or feedback, please refer to the project documentation.