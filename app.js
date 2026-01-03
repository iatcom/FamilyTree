// Global variables
let people = {};
let unions = [];
let unionsByPerson = {};
let childrenByPerson = {};
let parentsByPerson = {};
let unionsMap = {};

// Load data from JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        people = data.people;
        unions = data.unions;
        initializeIndexes();
        renderTree('mihai_i'); // Initial render
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Initialize indexes for faster lookups
function initializeIndexes() {
    unions.forEach(union => {
        unionsMap[union.id] = union;
        [union.partner1, union.partner2].filter(Boolean).forEach(p => {
            if (!unionsByPerson[p]) unionsByPerson[p] = [];
            unionsByPerson[p].push(union.id);
        });
        union.children.forEach(child => {
            [union.partner1, union.partner2].filter(Boolean).forEach(p => {
                if (!childrenByPerson[p]) childrenByPerson[p] = [];
                childrenByPerson[p].push(child);
            });
            if (!parentsByPerson[child]) parentsByPerson[child] = {};
            if (union.partner1) parentsByPerson[child].father = union.partner1;
            if (union.partner2) parentsByPerson[child].mother = union.partner2;
        });
    });

    // Deduplicate children arrays
    Object.keys(childrenByPerson).forEach(p => {
        childrenByPerson[p] = [...new Set(childrenByPerson[p])];
    });
}

// Get ancestors
function getAncestors(personId, depth = 0, maxDepth = 10) {
    if (depth >= maxDepth || !parentsByPerson[personId]) return [];
    const parents = parentsByPerson[personId];
    const parentIds = [parents.father, parents.mother].filter(Boolean);
    let ancestors = parentIds.map(id => ({ id, depth: depth + 1 }));
    parentIds.forEach(id => {
        ancestors = ancestors.concat(getAncestors(id, depth + 1, maxDepth));
    });
    return ancestors;
}

// Get descendants
function getDescendants(personId, depth = 0, maxInitialDepth = 2) {
    let descendants = [];
    const childIds = childrenByPerson[personId] || [];
    if (depth < maxInitialDepth) {
        descendants = childIds.map(id => ({ id, depth: depth + 1 }));
        childIds.forEach(id => {
            descendants = descendants.concat(getDescendants(id, depth + 1, maxInitialDepth));
        });
    } else if (childIds.length > 0) {
        descendants.push({ id: 'more', depth: depth + 1, label: `+${childIds.length} more` });
    }
    return descendants;
}

// Get spouses
function getSpouses(personId) {
    return (unionsByPerson[personId] || []).flatMap(uId => {
        const u = unionsMap[uId];
        return [u.partner1, u.partner2].filter(p => p && p !== personId);
    });
}

// Get union type between two people
function getUnionTypeBetween(p1, p2) {
    const sharedUnions = (unionsByPerson[p1] || []).filter(uId => unionsByPerson[p2].includes(uId));
    return sharedUnions.length > 0 ? unionsMap[sharedUnions[0]].type : 'unknown';
}

// Calculate age from birth date and optional death year
function calculateAge(birthDate, deathYear = null) {
    if (!birthDate) return null;
    const birthYear = parseInt(birthDate);
    
    if (deathYear) {
        // If person is deceased, calculate age at death
        const ageAtDeath = deathYear - birthYear;
        return ageAtDeath >= 0 ? ageAtDeath : null;
    } else {
        // If person is alive, calculate current age
        const today = new Date();
        const currentYear = today.getFullYear();
        let age = currentYear - birthYear;
        return age >= 0 ? age : null;
    }
}

// Format birth date
function formatBirthDate(birthDate) {
    if (!birthDate) return null;
    const date = new Date(birthDate);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Render tree
function renderTree(rootId) {
    const container = document.getElementById('tree-container');
    container.innerHTML = '';

    // Group ancestors by depth
    const ancestors = getAncestors(rootId);
    const ancestorGroups = {};
    ancestors.forEach(a => {
        if (!ancestorGroups[a.depth]) ancestorGroups[a.depth] = [];
        ancestorGroups[a.depth].push(a.id);
    });

    // Render ancestor generations
    for (let d = 10; d >= 1; d--) {
        if (ancestorGroups[d]) {
            const genDiv = document.createElement('div');
            genDiv.className = 'generation';
            ancestorGroups[d].forEach(id => genDiv.appendChild(createPersonBox(id)));
            container.appendChild(genDiv);
        }
    }

    // Render selected person + spouses
    const centerGen = document.createElement('div');
    centerGen.className = 'generation';
    const rootBox = createPersonBox(rootId, true);
    centerGen.appendChild(rootBox);

    const spouses = getSpouses(rootId);
    spouses.forEach(spouseId => {
        const unionType = getUnionTypeBetween(rootId, spouseId);
        const spouseBox = createPersonBox(spouseId, false, unionType);
        centerGen.appendChild(spouseBox);
    });
    container.appendChild(centerGen);

    // Group descendants by depth
    const descendants = getDescendants(rootId);
    const descendantGroups = {};
    descendants.forEach(d => {
        if (!descendantGroups[d.depth]) descendantGroups[d.depth] = [];
        descendantGroups[d.depth].push(d.id);
    });

    // Render descendant generations
    const maxRenderedDepth = Math.max(...Object.keys(descendantGroups).map(Number));
    for (let d = 1; d <= maxRenderedDepth; d++) {
        if (descendantGroups[d]) {
            const genDiv = document.createElement('div');
            genDiv.className = 'generation';
            descendantGroups[d].forEach(id => {
                if (id === 'more') {
                    const moreBox = document.createElement('div');
                    moreBox.className = 'person';
                    moreBox.textContent = '+ more descendants';
                    genDiv.appendChild(moreBox);
                } else {
                    genDiv.appendChild(createPersonBox(id));
                }
            });
            container.appendChild(genDiv);
        }
    }

    // Draw relationship lines after rendering
    setTimeout(drawRelationshipLines, 100);

    // Add event listeners for scroll and resize to redraw lines
    window.addEventListener('scroll', drawRelationshipLines, { passive: true });
    window.addEventListener('resize', drawRelationshipLines);
}

// Draw relationship lines between people
function drawRelationshipLines() {
    const svg = document.getElementById('relationship-lines');
    svg.innerHTML = '';

    // Helper function to find union between two people
    function findUnionBetween(id1, id2) {
        return unions.find(u => 
            (u.partner1 === id1 && u.partner2 === id2) || 
            (u.partner1 === id2 && u.partner2 === id1)
        );
    }

    // Draw spouse/partner lines
    unions.forEach(union => {
        if (!union.partner1 || !union.partner2) return;

        const box1 = document.querySelector(`[data-person-id="${union.partner1}"]`);
        const box2 = document.querySelector(`[data-person-id="${union.partner2}"]`);

        if (!box1 || !box2) return;

        // Verify this is the correct union between these two people
        const correctUnion = findUnionBetween(union.partner1, union.partner2);
        if (!correctUnion || correctUnion.id !== union.id) return;

        const rect1 = box1.getBoundingClientRect();
        const rect2 = box2.getBoundingClientRect();

        const x1 = rect1.left + rect1.width / 2;
        const y1 = rect1.top + rect1.height / 2;
        const x2 = rect2.left + rect2.width / 2;
        const y2 = rect2.top + rect2.height / 2;

        // Use the union's type for the line style
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', `relationship-line ${union.type}`);
        line.setAttribute('data-union-id', union.id);
        svg.appendChild(line);
    });

    // Draw parent-child lines
    Object.keys(childrenByPerson).forEach(parentId => {
        const parentBox = document.querySelector(`[data-person-id="${parentId}"]`);
        if (!parentBox) return;

        const parentRect = parentBox.getBoundingClientRect();
        const parentX = parentRect.left + parentRect.width / 2;
        const parentY = parentRect.top + parentRect.height;

        childrenByPerson[parentId].forEach(childId => {
            const childBox = document.querySelector(`[data-person-id="${childId}"]`);
            if (!childBox) return;

            const childRect = childBox.getBoundingClientRect();
            const childX = childRect.left + childRect.width / 2;
            const childY = childRect.top;

            // Draw curved line from parent to child
            const midY = (parentY + childY) / 2;

            const pathData = `M ${parentX} ${parentY} Q ${parentX} ${midY}, ${childX} ${childY}`;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('class', 'family-line');
            path.setAttribute('data-parent-id', parentId);
            path.setAttribute('data-child-id', childId);
            svg.appendChild(path);
        });
    });
}

// Create person box
function createPersonBox(id, isSelected = false, unionType = null) {
    const person = people[id];
    if (!person) return document.createElement('div');

    const box = document.createElement('div');
    box.className = 'person' + (isSelected ? ' selected' : '') + (unionType ? ' spouse' : '');
    box.setAttribute('data-person-id', id);
    
    box.innerHTML = '';
    
    if (unionType) {
        const unionBar = document.createElement('div');
        unionBar.className = `union-bar ${unionType}`;
        box.appendChild(unionBar);
    }
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'person-name';
    nameDiv.textContent = `${person.name}`;
    box.appendChild(nameDiv);
    
    const genderDiv = document.createElement('div');
    genderDiv.className = 'person-info';
    genderDiv.textContent = `Gender: ${person.gender === 'M' ? 'Male' : person.gender === 'F' ? 'Female' : 'Unknown'}`;
    box.appendChild(genderDiv);
    
    if (person.birth) {
        const birthDiv = document.createElement('div');
        birthDiv.className = 'person-info';
        const birthYear = person.birth;
        
        if (person.death) {
            // Person is deceased
            const age = calculateAge(person.birth, parseInt(person.death));
            birthDiv.textContent = `${birthYear} - ${person.death}`;
            if (age !== null) {
                birthDiv.textContent += ` (lived ${age} years)`;
            }
        } else {
            // Person is alive
            const age = calculateAge(person.birth);
            birthDiv.textContent = `Born: ${birthYear}`;
            if (age !== null) {
                birthDiv.textContent += ` (${age} years)`;
            }
        }
        box.appendChild(birthDiv);
    }
    
    if (person.additionalInfo) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'person-info';
        infoDiv.textContent = `Info: ${person.additionalInfo}`;
        box.appendChild(infoDiv);
    }

    box.addEventListener('click', () => renderTree(id));
    return box;
}

// Load data on page load
document.addEventListener('DOMContentLoaded', loadData);
