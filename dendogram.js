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

// Add a group inside the SVG so the graph has some margin.
const dGroup = dSvg.append("g")
  .attr("transform", "translate(100,40)");

// Create a cluster layout. Cluster is commonly used for dendrograms.
const clusterLayout = d3.cluster()
  .size([dHeight - 80, dWidth - 300]);

// Load the CSV file.
// The CSV contains dot-separated IDs such as:
// Books.Children's Books.Age 3-5.ABCs
d3.csv("flare.csv").then(function(data) {

  // d3.stratify converts the flat CSV rows into a hierarchy.
  // Each row has an id. The parent is everything before the last dot.
  const stratify = d3.stratify()
    .id(d => d.id)
    .parentId(d => {
      const lastDot = d.id.lastIndexOf(".");
      return lastDot >= 0 ? d.id.substring(0, lastDot) : null;
    });

  // Create the hierarchical root object from the CSV data.
  const root = stratify(data);

  // Apply the cluster layout so each node gets x and y coordinates.
  clusterLayout(root);

  // Draw the links between parent and child nodes.
  dGroup.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x)
    );

  // Create one group per node.
  const node = dGroup.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  // Draw a circle for each node.
  node.append("circle")
    .attr("r", 4);

  // Show the node name only, not the full dot-separated path.
  // Example: Books.Children's Books.Age 3-5.ABCs -> ABCs
  node.append("text")
    .attr("dy", 4)
    .attr("x", d => d.children ? -10 : 10)
    .style("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.id.substring(d.id.lastIndexOf(".") + 1));
});
