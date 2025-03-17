document.addEventListener("DOMContentLoaded", function () {
    // Load the graph data from nodes-links.json
    Promise.all([
        fetch("config/nodes-links.json").then(response => response.json()),
        fetch("config/clickable-nodes.json").then(response => response.json()),
        fetch("config/node-details.json").then(response => response.json())
    ]).then(([graph, clickableNodes, nodeDetails]) => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

        const simulation = d3.forceSimulation(graph.nodes)
            .force("link", d3.forceLink(graph.links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // Add links (edges)
        const link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .attr("stroke", "#999")
            .attr("stroke-width", 2);

        // Add link labels
        const linkText = svg.selectAll(".link-text")
            .data(graph.links)
            .enter().append("text")
            .attr("class", "link-text")
            .attr("font-size", "12px")
            .attr("fill", "#555")
            .text(d => d.label);

        // Add nodes (circles)
        const node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("r", 12)
            .attr("fill", d => d.color)  // ✅ Use color directly from nodes-links.json
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5)
            .call(d3.drag()
                .on("start", dragStarted)
                .on("drag", dragged)
                .on("end", dragEnded));

        // Add node labels
        const nodeText = svg.selectAll(".node-text")
            .data(graph.nodes)
            .enter().append("text")
            .attr("class", "node-text")
            .attr("font-size", "14px")
            .attr("dx", 15)
            .attr("dy", 5)
            .text(d => d.name);

        // Click event for displaying node details
        node.on("click", function (event, d) {
            if (Array.isArray(clickableNodes.clickable) && clickableNodes.clickable.includes(d.id) && nodeDetails[d.id]) {
                showNodeDetails(d.id, nodeDetails[d.id]);
            }
        });

        simulation.on("tick", () => {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            linkText.attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);

            node.attr("cx", d => d.x)
                .attr("cy", d => d.y);

            nodeText.attr("x", d => d.x + 15)
                .attr("y", d => d.y + 5);
        });

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

        function showNodeDetails(nodeId, details) {
            let detailHtml = `<h3>${nodeId} Details</h3><table border='1'><tr><th>Column Name</th><th>Data Type</th></tr>`;

            details.columns.forEach(column => {
                detailHtml += `<tr><td>${column.name}</td><td>${column.type}</td></tr>`;
            });

            detailHtml += `</table><button onclick="closePopup()">Close</button>`;

            const popup = document.getElementById("popup");
            popup.innerHTML = detailHtml;
            popup.style.display = "block";
        }
    });
});

// Function to close pop-up
function closePopup() {
    document.getElementById("popup").style.display = "none";
}
