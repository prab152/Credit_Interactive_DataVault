const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

console.log("SVG Loaded");

// Load JSON files
Promise.all([
    d3.json("config/nodes-links.json"),
    d3.json("config/clickable-nodes.json"),
    d3.json("config/node-details.json")
]).then(([graph, clickableNodes, nodeDetails]) => {
    console.log("Data Loaded", graph, clickableNodes, nodeDetails);

    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-width", 2);

    const node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", 10)
        .attr("fill", "blue")
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

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

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

}).catch(error => console.error("Error loading data", error));
