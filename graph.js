// Set SVG size
const width = window.innerWidth;
const height = window.innerHeight;

// Select SVG
const svg = d3.select("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

// Define arrow markers for directed edges
const defs = svg.append("defs");
defs.append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#999");

// Load data files
Promise.all([
    d3.json("config/nodes-links.json"),
    d3.json("config/clickable-nodes.json"),
    d3.json("config/node-details.json")
]).then(([graph, clickableNodes, nodeDetails]) => {

    // Force simulation
    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

    // Draw links
    const link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.8)
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrow)");

    // Link labels
    const linkLabels = svg.selectAll(".link-label")
        .data(graph.links)
        .enter().append("text")
        .attr("class", "link-label")
        .attr("dy", -5)
        .attr("font-size", "12px")
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text(d => d.label);

    // Draw nodes
    const node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    // Draw circles
    node.append("circle")
        .attr("r", 12)
        .attr("fill", d => getColor(d.group))
        .on("click", (event, d) => showNodeDetails(d.id));

    // Add text labels (Node Names)
    node.append("text")
        .attr("dy", -18)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text(d => d.id);

    function ticked() {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        linkLabels.attr("x", d => (d.source.x + d.target.x) / 2)
                  .attr("y", d => (d.source.y + d.target.y) / 2);

        node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    }

    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function getColor(group) {
        return group === "yellow" ? "yellow" :
               group === "green" ? "green" : "red";
    }

    function showNodeDetails(nodeId) {
        if (clickableNodes.clickable.includes(nodeId)) {
            const details = nodeDetails[nodeId] || {};
            const description = details.description || "No description available.";
            const columns = details.columns ? details.columns.map(c => `${c.name} (${c.type})`).join("\n") : "No columns defined.";
            alert(`${nodeId}\n\n${description}\n\nColumns:\n${columns}`);
        }
    }
});
