// API URLs
const getDataURL = 'http://localhost/organigrama/api/tree/read.php';
const postDataURL = 'http://localhost/organigrama/api/tree/create.php';
const deleteDataURL = 'http://localhost/organigrama/api/tree/delete.php';
const updateDataURL = 'http://localhost/organigrama/api/tree/update.php';

// Icons HTML
const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
const chevronDown = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>`
const chevronUp = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-up"><polyline points="18 15 12 9 6 15"></polyline></svg>`

// Stores node states (if the children of a node are shown or not)
const nodeStates = {};
// Stores nodes data (id, node_name, username, parent_node_id)
const nodesData = {};

// Builds tree structure in an object
function buildTree(data) {
    const tree = {};
    data.forEach(node => {
        tree[node.id] = {...node, children: []};
        nodesData[node.id] = {...node};
    });
    data.forEach(node => {
        if (node.parent_node_id !== null) {
            tree[node.parent_node_id].children.push(tree[node.id]);
        }
    });
    return tree[0];
}

// Generates HTML recursive for the tree
function generateTreeHTML(node) {
    let html = `<div class="node">
                    <div class="role-name">
                        <span><strong>${node.username}, </strong>${node.node_name}</span>
                        <div>`;
    if (node.parent_node_id !== null) {
        html += `<span class="delete-add-btn delete-btn" node-id="${node.id}" parent-node-id="${node.parent_node_id}">Delete</span>
                 <span class="delete-add-btn add-btn" node-id="${node.id}">Add</span>
                 <span class="delete-add-btn move-btn" node-id="${node.id}" parent-node-id="${node.parent_node_id}">Move</span>`;
    } else {
        html += `<span class="delete-add-btn add-btn" node-id="${node.id}">Add</span>`;
    }

    if (node.children && node.children.length > 0) {
        if (nodeStates[node.id] === "closed" || !nodeStates[node.id]) {
            html += `<span class="chevron" id="chevron-${node.id}" onclick="toggleChildren(event, ${node.id})">${chevronDown}</span>`;
        } else {
            html += `<span class="chevron" id="chevron-${node.id}" onclick="toggleChildren(event, ${node.id})">${chevronUp}</span>`;
        }
    }

    html += `</div></div>`;

    if (node.children && node.children.length > 0) {
        const displayStyle = nodeStates[node.id] === 'open' ? 'block' : 'none';
        html += `<div class="children" id="children-${node.id}" style="display: ${displayStyle};">`;
        node.children.forEach(child => {
            html += generateTreeHTML(child);
        });
        html += '</div>';
    }
    html += '</div>';
    return html;
}


// Toggle visibility of a node children
function toggleChildren(event, nodeId) {
    event.stopPropagation();

    const childrenDiv = document.getElementById(`children-${nodeId}`);
    const chevronIcon = document.getElementById(`chevron-${nodeId}`)
    if (childrenDiv) {
        if (childrenDiv.style.display === 'none') {
            childrenDiv.style.display = 'block';
            nodeStates[nodeId] = 'open';
            chevronIcon.innerHTML = chevronUp
        } else {
            childrenDiv.style.display = 'none';
            nodeStates[nodeId] = 'closed';
            chevronIcon.innerHTML = chevronDown
        }
    }

}


// Send a request to the server to read data
async function fetchData(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Creates a form to add a node in the tree
function createAddNodeForm() {
    document.querySelectorAll(".add-btn").forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.modal').classList.add("modal-background");
            const nodeId = button.getAttribute("node-id");
            const modalHtml = `<div class="modal-content">
            <p class="close-modal">${closeIcon}</p>   
            <form node-id="${nodeId}">
                <label for="username">First and second name:</label>
                <input type="text" id="username" name="username">
                <label for="role">Role:</label>
                <input type="text" id="role" name="role">
                <p class="modal-question">Do you want to move all of the children of this person under the new person?</p>
                <div class="margin-bottom-12">
                    <input type="checkbox" id="node-type">
                    <label for="node-type">Yes</label>
                </div>
                <input type="submit" value="Add person">
            </form>
        <p class="modal-error display-none">Fill all the required fields.</p>
        </div>`;
            document.querySelector(".modal").innerHTML = modalHtml;
            const closeModal = document.querySelector(".close-modal");
            closeModal.addEventListener("click", () => {
                document.querySelector('.modal').classList.remove("modal-background");
                document.querySelector(".modal").innerHTML = '';
            })
            const form = document.querySelector(".modal form");
            form.addEventListener("submit", postData);
        })
    })
}

// Sends a request tp post data to the server
async function postData(event) {
    event.preventDefault();
    const form = event.target;
    const nodeId = form.getAttribute("node-id");
    const roleInput = form.querySelector('input[name=role]');
    const userNameInput = form.querySelector('input[name=username]');
    const checkboxInput = form.querySelector('input[type=checkbox]');
    const role = roleInput.value;
    const username = userNameInput.value;
    let checkbox = false;
    if (checkboxInput.checked) {
        checkbox = true;
    }

    if (!username || !role) {
        document.querySelector('.modal-error').classList.add("display-block");
        return;
    }

    try {
        const response = await fetch(postDataURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                node_id: nodeId,
                node_name: role,
                username: username,
                where_to_add_node: checkbox
            })
        });

        if (!response.ok) {
            throw new Error('Failed to post data.');
        }

        const responseData = await response.json();
        const new_node_id = responseData.new_node_id;

        document.querySelector('.modal').classList.remove("modal-background");
        document.querySelector(".modal").innerHTML = '';
        buildTreeWithData();

        nodeStates[new_node_id] = 'open';
        nodeStates[nodeId] = 'open';
    } catch (error) {
        console.error('Error posting data: ', error);
    }
}

// Creates a form to delete a node from the tree
function createDeleteNodeForm() {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.modal').classList.add("modal-background");
            const nodeId = button.getAttribute("node-id");
            const parentNodeId = button.getAttribute("parent-node-id");
            const modalHtml = `<div class="modal-content">
            <p class="close-modal">${closeIcon}</p>
            <form node-id="${nodeId}" parent-node-id="${parentNodeId}">
                <p>Do you want to delete all the children of this person?</p>
                <div class="flex" style="gap: 12px;">
                    <button class="delete-form-btn" type="submit" value="true">Yes</button>
                    <button class="delete-form-btn" type="submit" value="false">No</button>
                </div>
            </form>
        <p class="modal-error display-none">Fill all the required fields.</p>
        </div>`;
            document.querySelector(".modal").innerHTML = modalHtml;
            const closeModal = document.querySelector(".close-modal");
            closeModal.addEventListener("click", () => {
                document.querySelector('.modal').classList.remove("modal-background");
                document.querySelector(".modal").innerHTML = '';
            })
            const form = document.querySelector(".modal form");
            form.addEventListener("submit", deleteData);

        })
    })
}

// Sends a request to the server to delete a node from the tree
async function deleteData(event) {
    event.preventDefault();
    const form = event.target;
    const nodeId = form.getAttribute("node-id");
    const parentNodeId = form.getAttribute("parent-node-id");
    const value = event.submitter.value;
    const deleteChildren = (value === 'true');
    try {
        const response = await fetch(deleteDataURL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                node_id: nodeId,
                parent_node_id: parentNodeId,
                delete_children: deleteChildren
            })
        });

        if (!response.ok) {
            throw new Error('Failed to delete data.');
        }

        document.querySelector('.modal').classList.remove("modal-background");
        document.querySelector(".modal").innerHTML = '';

        buildTreeWithData();
    } catch (error) {
        console.error('Error posting data: ', error);
    }
}

// Creates a form for user input to move a node in the tree
function createMoveNodeForm() {
    document.querySelectorAll(".move-btn").forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.modal').classList.add("modal-background");
            const nodeId = button.getAttribute("node-id");
            const parentNodeId = button.getAttribute("parent-node-id");
            let optionsHTML = '';
            for (const nodeId in nodesData) {
                const node = nodesData[nodeId];
                optionsHTML += `<option value="${node.id}">${node.username}, ${node.node_name}</option>`
            }
            const modalHtml = `<div class="modal-content">
            <p class="close-modal">${closeIcon}</p>
            <form id="move-node" node-id="${nodeId}" parent-node-id="${parentNodeId}">
                <p class="modal-question">Select where you want to move this person.</p>
                <select name="nodes" id="move-node">
                    ${optionsHTML}
                </select>
                <p class="modal-question">Do you want to move also its children?</p>
                <div class="margin-bottom-12">
                    <input type="checkbox" id="node-type">
                    <label for="node-type">Yes</label>
                </div>
                <input type="submit" value="Move person">
            </form>
        <p class="modal-error display-none">Fill all the required fields.</p>
        </div>`;
            document.querySelector(".modal").innerHTML = modalHtml;
            const closeModal = document.querySelector(".close-modal");
            closeModal.addEventListener("click", () => {
                document.querySelector('.modal').classList.remove("modal-background");
                document.querySelector(".modal").innerHTML = '';
            })
            const form = document.querySelector(".modal form");
            form.addEventListener("submit", updateData);
        })
    })
}

//Sends the request to the server to update a node in the tree
async function updateData(event) {
    event.preventDefault();
    const form = event.target;
    const nodeId = form.getAttribute("node-id");
    const parentNodeId = form.getAttribute("parent-node-id");
    const checkboxInput = form.querySelector('input[type=checkbox]');
    const select = form.querySelector('select');
    const option = select.value;
    let checkbox = false;
    if (checkboxInput.checked) {
        checkbox = true;
    }

    try {
        const response = await fetch(updateDataURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                node_id: nodeId,
                parent_node_id: parentNodeId,
                new_parent_node_id: option,
                move_children: checkbox
            })
        });

        if (!response.ok) {
            throw new Error('Failed to delete data.');
        }

        document.querySelector('.modal').classList.remove("modal-background");
        document.querySelector(".modal").innerHTML = '';

        buildTreeWithData();
    } catch (error) {
        console.error('Error posting data: ', error);
    }
}

//Builds the tree to be displayed on the frontend with the data from the server
async function buildTreeWithData() {
    const data = await fetchData(getDataURL);
    const tree = buildTree(data.data);
    const displayTreeContainer = document.querySelector(".display-tree");
    displayTreeContainer.innerHTML = generateTreeHTML(tree);

    createAddNodeForm();
    createDeleteNodeForm();
    createMoveNodeForm();
}


buildTreeWithData();









