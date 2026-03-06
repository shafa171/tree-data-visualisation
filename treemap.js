// ------------------------------------------------------------
// TREEMAP
// This file reads the JSON data and creates a treemap.
// The user can choose whether the rectangle size represents
// number of books sold or revenue.
// The tooltip text also changes when the radio button changes.
// ------------------------------------------------------------

// Set the size of the treemap SVG.
const tWidth = 1100;
const tHeight = 650;

// Select the SVG element from index.html.
const tSvg = d3.select("#treemapSvg")
  .attr("width", tWidth)
  .attr("height", tHeight);

// Add a group inside the SVG to hold the treemap.
const tGroup = tSvg.append("g");

// Load the JSON data once.
// Then redraw the treemap whenever the user changes the metric.
d3.json("flare.json").then(function(data) {

  // Draw the treemap for the first time using "sold".
  drawTreemap(data, "sold");

  // Listen for radio button changes.
  d3.selectAll("input[name='metric']").on("change", function() {
    drawTreemap(data, this.value);
  });
});

// This function draws or redraws the treemap.
// metric will be either "sold" or "revenue".
function drawTreemap(data, metric) {

  // Remove any old treemap shapes/text before drawing the new one.
  tGroup.selectAll("*").remove();

  // Convert the JSON structure into a D3 hierarchy.
  // .sum(...) decides what value determines the rectangle size.
  const root = d3.hierarchy(data)
    .sum(d => d[metric] || 0)
    .sort((a, b) => b.value - a.value);

  // Create the treemap layout and compute rectangle positions.
  d3.treemap()
    .size([tWidth, tHeight])
    .padding(3)(root);

  // Use a color scale so top-level categories get different colors.
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Only draw leaf nodes because they are the final rectangles.
  const nodes = tGroup.selectAll(".treemap-node")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "treemap-node")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  // Draw one rectangle for each leaf node.
  nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => {
      // Color by top-level genre.
      let ancestor = d;
      while (ancestor.depth > 1) {
        ancestor = ancestor.parent;
      }
      return color(ancestor.data.name);
    });

  // Add a tooltip.
  // Bonus requirement: this text changes depending on which radio
  // button is selected (sold or revenue).
  nodes.append("title")
    .text(d => {
      const path = d.ancestors()
        .reverse()
        .map(node => node.data.name)
        .join(" > ");

      if (metric === "sold") {
        return `${path}\nBooks Sold: ${d.data.sold}`;
      } else {
        return `${path}\nRevenue: $${d.data.revenue}`;
      }
    });

  // Add the topic name inside each rectangle.
  nodes.append("text")
    .attr("x", 6)
    .attr("y", 18)
    .text(d => d.data.name);

  // Add a second line showing the currently selected value.
  nodes.append("text")
    .attr("x", 6)
    .attr("y", 34)
    .text(d => {
      if (metric === "sold") {
        return `Sold: ${d.data.sold}`;
      } else {
        return `Revenue: $${d.data.revenue}`;
      }
    });
}
