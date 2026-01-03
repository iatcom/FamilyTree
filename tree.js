const svg = document.getElementById("tree");
const modal = document.getElementById("modal");
const details = document.getElementById("details");
const closeBtn = document.getElementById("close");

fetch("family.json")
  .then(r => r.json())
  .then(data => drawTree(data.people));

function drawTree(people) {
  const map = Object.fromEntries(people.map(p => [p.id, p]));

  // compute generation depth
  function depth(p) {
    if (!p.parents) return 0;
    return 1 + Math.max(...p.parents.map(id => depth(map[id])));
  }

  people.forEach(p => p.gen = depth(p));

  const levels = {};
  people.forEach(p => {
    levels[p.gen] ??= [];
    levels[p.gen].push(p);
  });

  const xGap = 200;
  const yGap = 150;

  Object.values(levels).forEach(level =>
    level.forEach((p, i) => {
      p.x = i * xGap + 150;
      p.y = p.gen * yGap + 100;
    })
  );

  // draw lines
  people.forEach(p => {
    if (!p.parents) return;
    p.parents.forEach(pid => {
      const parent = map[pid];
      line(parent.x, parent.y + 30, p.x, p.y - 30);
    });
  });

  // draw people
  people.forEach(p => node(p));
}

function node(p) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const rect = document.createElementNS(svg.namespaceURI, "rect");
  rect.setAttribute("x", p.x - 70);
  rect.setAttribute("y", p.y - 30);
  rect.setAttribute("width", 140);
  rect.setAttribute("height", 50);
  rect.setAttribute("rx", 6);
  rect.classList.add("person");

  rect.onclick = () => show(p);

  const text = document.createElementNS(svg.namespaceURI, "text");
  text.setAttribute("x", p.x);
  text.setAttribute("y", p.y);
  text.classList.add("name");
  text.textContent = p.name;

  g.append(rect, text);
  svg.appendChild(g);
}

function line(x1, y1, x2, y2) {
  const l = document.createElementNS(svg.namespaceURI, "line");
  l.setAttribute("x1", x1);
  l.setAttribute("y1", y1);
  l.setAttribute("x2", x2);
  l.setAttribute("y2", y2);
  l.classList.add("line");
  svg.appendChild(l);
}

function show(p) {
  details.innerHTML = `
    <strong>${p.name}</strong><br>
    Born: ${p.birth || "?"}<br>
    ${p.death ? "Died: " + p.death : ""}
  `;
  modal.classList.remove("hidden");
}

closeBtn.onclick = () => modal.classList.add("hidden");
modal.onclick = e => e.target === modal && modal.classList.add("hidden");

/* Pan & zoom */
let scale = 1, panX = 0, panY = 0, dragging = false, sx, sy;

svg.addEventListener("wheel", e => {
  e.preventDefault();
  scale *= e.deltaY < 0 ? 1.1 : 0.9;
  apply();
});

svg.addEventListener("mousedown", e => {
  dragging = true;
  sx = e.clientX - panX;
  sy = e.clientY - panY;
});

window.addEventListener("mousemove", e => {
  if (!dragging) return;
  panX = e.clientX - sx;
  panY = e.clientY - sy;
  apply();
});

window.addEventListener("mouseup", () => dragging = false);

function apply() {
  svg.style.transform = `translate(${panX}px,${panY}px) scale(${scale})`;
}
