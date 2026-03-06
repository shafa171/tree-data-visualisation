// ------------------------------------------------------------
// DENDROGRAM
// This file reads the CSV data and creates a dendrogram that
// shows the hierarchy of books as Genre -> Sub-genre -> Topic.
// ------------------------------------------------------------

// Set the size of the SVG drawing area.
const dWidth = 1100;
const dHeight = 650;

// Select the SVG element from index.html and assign width/height.
const dSvg = d3.select("#dendrogramSvg")
  .attr("width", dWidth)
  .attr("height", dHeight);

// Clear anything old just in case.
dSvg.selectAll("*").remove();

// Add a group inside the SVG so the graph has some margin.
const dGroup = dSvg.append("g")
  .attr("transform", "translate(100,40)");

// Create a cluster layout. Cluster is commonly used for dendrograms.
const clusterLayout = d3.cluster()
  .size([dHeight - 80, dWidth - 300]);

d3.csv("./flare.csv").then(function(data) {
  console.log("Raw dendrogram CSV:", data);

  // Remove blank or broken rows.
  data = data.filter(d => d.id && d.id.trim() !== "");

  console.log("Filtered dendrogram CSV:", data);

  const stratify = d3.stratify()
    .id(d => d.id.trim())
    .parentId(d => {
      const id = d.id.trim();
      const lastDot = id.lastIndexOf(".");
      return lastDot >= 0 ? id.substring(0, lastDot) : null;
    });

  const root = stratify(data);

  console.log("Dendrogram root:", root);

  clusterLayout(root);

  // Draw links
  dGroup.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x)
    );

  // Draw nodes
  const node = dGroup.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle")
    .attr("r", 4);

  node.append("text")
    .attr("dy", 4)
    .attr("x", d => d.children ? -10 : 10)
    .style("text-anchor", d => d.children ? "end" : "start")
    .text(d => {
      const id = d.id.trim();
      const lastDot = id.lastIndexOf(".");
      return lastDot >= 0 ? id.substring(lastDot + 1) : id;
    });

  document.getElementById("statusMessage").textContent = "Visualizations loaded.";
}).catch(function(error) {
  console.error("Dendrogram error:", error);
  document.getElementById("statusMessage").textContent =
    "Dendrogram failed to load. Check flare.csv formatting in the console.";
});
