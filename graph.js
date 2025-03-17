// Load configuration files
Promise.all([
    fetch("config/nodes-links.json").then(res => res.json()),
    fetch("config/clickable-node.json").then(res => res.json()),
    fetch("config/node-details.json").then(res => res.json())
]).then(([graphData, clickableNode, nodeDetails]) => {
    const width = 900, height = 600;

    const svg = d3.select("svg"),
        g = svg.append("g");

    const link = g.selectAll(".link")
        .data(graphData.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke", d => d.color)
        .style("stroke-width", 2)
        .attr("marker-end", "url(#arrow)");

    const node = g.selectAll(".node")
        .data(graphData.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 8)
        .style("fill", d => d.color)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Add node labels
    g.selectAll(".label")
        .data(graphData.nodes)
        .enter().append("text")
        .attr("class", "label")
        .attr("dy", -10)
        .text(d => d.name);

    // Simulation setup
    const simulation = d3.forceSimulation(graphData.nodes)
        .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", () => {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("cx", d => d.x).attr("cy", d => d.y);
        });

    // Make "Customer" node clickable
    node.on("click", function(event, d) {
        if (d.id === clickableNode.nodeId) {
            document.getElementById("node-title").innerText = nodeDetails.title;
            document.getElementById("node-description").innerText = nodeDetails.description;

            const tbody = document.getElementById("node-table").querySelector("tbody");
            tbody.innerHTML = "";
            nodeDetails.columns.forEach(col => {
                const row = `<tr><td>${col.name}</td><td>${col.type}</td></tr>`;
                tbody.innerHTML += row;
            });

            document.getElementById("node-modal").style.display = "block";
        }
    });

    // Drag functions
    function dragstarted(event, d) {
        simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event, d) {
        d.fx = null;
        d.fy = null;
    }

    // Close modal
    document.querySelector(".close").addEventListener("click", () => {
        document.getElementById("node-modal").style.display = "none";
    });
});
