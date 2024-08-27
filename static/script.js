function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    if (taskText) {
        // Include the creation timestamp in the task object
        const task = {
            task: taskText,
            createdTime: new Date().getTime() // Current timestamp in milliseconds
        };

        // Fetch request to add the task to the server
        fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task) // Send the task object with the timestamp
        }).then(response => response.json())
          .then(updateTaskList)
          .catch(error => console.error('Error adding task:', error));

        // Clear the input field after adding the task
        taskInput.value = '';
    }
}



function setupEventListeners() {
    const addTaskButton = document.getElementById('addTaskButton');
    addTaskButton.addEventListener('click', addTask);

    const taskInput = document.getElementById('taskInput');
    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Load tasks when the window loads
    fetch('/tasks').then(response => response.json()).then(updateTaskList);
}


function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}


// Function to handle keypress on the input field
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addTask();
    }
}


function deleteTask(taskText, event) {
    event.stopPropagation(); // Prevent triggering other click events
    fetch('/tasks', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: taskText }),
    }).then(response => response.json())
      .then(updateTaskList);
}

function getTaskSuggestion(taskText, taskElement) {
    showLoader();
    fetch('/suggest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: taskText }),
    }).then(response => response.json())
      .then(data => {
          hideLoader();
          console.log("GPT API response:", data); // Log the API response
          createDialog(taskText, data.suggestion, taskElement);
      }).catch(error => {
          hideLoader();
          console.error('Error fetching suggestion:', error); // Log any errors
      });
}

function createDialog(taskText, suggestion, taskElement) {
    // Remove any existing dialog
    const existingDialog = document.getElementById('dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    // Create a new dialog element
    const dialog = document.createElement('div');
    dialog.id = 'dialog';
    dialog.innerHTML = `
        <strong>Suggestion for "${taskText}":</strong>
        <p>${suggestion}</p>
        <button id="closeDialog">Close</button>
    `;

    // Append the dialog to the body
    document.body.appendChild(dialog);

    // Position the dialog near the task text
    positionDialog(dialog, taskElement);

    // Add event listener to the close button
    document.getElementById('closeDialog').addEventListener('click', function() {
        dialog.remove();
    });
}


function positionDialog(dialog, taskElement) {
    const rect = taskElement.getBoundingClientRect();
    dialog.style.position = 'absolute';
    dialog.style.left = `${rect.left}px`; // Position to the left of the task
    dialog.style.top = `${rect.bottom + 10}px`; // Just below the task, with a little gap
}


let userCoins = 0; // Initialize with 0 coins


function addGoldCoins(amount) {
    userCoins += amount;
    document.getElementById('coinCount').textContent = userCoins;
}

function calculateCoins(createdTime) {
    const currentTime = new Date().getTime();
    const hoursElapsed = (currentTime - createdTime) / (1000 * 60 * 60);

    let coinsToAdd = 0;
    if (0 <= hoursElapsed <= 1) {
        coinsToAdd = 3;
    } else if (1 < hoursElapsed <= 6) {
        coinsToAdd = 2;
    } else if (6 < hoursElapsed <= 24) {
        coinsToAdd = 1;
    } else if (hoursElapsed > 24) {
        coinsToAdd = -1; // Decrease by 1 coin if more than 24 hours
    }

    addGoldCoins(coinsToAdd);
}

function dailyTaskCheck() {
    const currentTime = new Date().getTime();
    tasks.forEach(task => {
        const hoursElapsed = (currentTime - task.createdTime) / (1000 * 60 * 60);
        if (hoursElapsed > 24) {
            addGoldCoins(-1);
        }
    });
}

// Check every 24 hours (86400000 milliseconds)
setInterval(dailyTaskCheck, 86400000);

const storeItems = [
    { name: "Coffee", cost: 10, icon: "static/coffee icon.png" },
    { name: "Books", cost: 15, icon: "static/books icon.png" },
    { name: "Headphones", cost: 30, icon: "static/headphone icon.png" },
    { name: "Sakura Trees", cost: 40, icon: "static/sakura trees icon.png" },
    { name: "Grandfather Clock", cost: 50, icon: "static/grandfather clock icon.png" },
    { name: "Figure Skates", cost: 60, icon: "static/figure skates icon.png" },
    { name: "Oil Painting", cost: 75, icon: "static/oil painting icon.png" },
    { name: "Violin", cost: 100, icon: "static/violin icon.png" }
];

function displayStoreItems() {
    const storeDiv = document.getElementById('storeItems');
    storeDiv.innerHTML = ''; // Clear existing content
    storeItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'store-item';
        itemDiv.innerHTML = `
            <img src="${item.icon}" alt="${item.name}" style="width: 50px; height: 50px;">
            <p>${item.name} - ${item.cost} Coins</p>
            <button onclick="purchaseItem('${item.name}', ${item.cost})">Buy</button>
        `;
        storeDiv.appendChild(itemDiv);
    });
}

let userPossessions = [];

function purchaseItem(itemName, cost) {
    if (userCoins >= cost) {
        userCoins -= cost; // Deduct the cost from the user's coin balance
        userPossessions.push(itemName); // Add the item to the user's possessions
        displayUserPossessions(); // Update the display of possessions
        document.getElementById('coinCount').textContent = userCoins; // Update the displayed coin count
    } else {
        alert("Not enough gold coins!");
    }
}

function displayUserPossessions() {
    const possessionsDiv = document.getElementById('possessionsList');
    possessionsDiv.innerHTML = ''; // Clear current possessions

    userPossessions.forEach(itemName => {
        // Find the item in the storeItems array to get its icon
        const item = storeItems.find(storeItem => storeItem.name === itemName);
        if (item) {
            const itemIcon = document.createElement('img');
            itemIcon.src = item.icon;
            itemIcon.alt = itemName;
            itemIcon.style.width = '50px'; // Set image size (can be adjusted)
            itemIcon.style.height = '50px';
            possessionsDiv.appendChild(itemIcon);
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('storeIcon').addEventListener('click', function() {
        openDialog('storePossessionsDialog');
        document.querySelector('.tablinks').click(); // Open the first tab by default
    });
    // Ensure coin count is displayed
    document.getElementById('coinCount').textContent = userCoins;
});


function openDialog(dialogId) {
    document.getElementById(dialogId).style.display = 'block';
    if (dialogId === 'storePossessionsDialog') {
        displayStoreItems(); // Display store items when the dialog opens
    }
}

function closeDialog(dialogId) {
    document.getElementById(dialogId).style.display = 'none';
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if (tabName === 'VirtualStore') {
        displayStoreItems(); // Re-display store items when the Virtual Store tab is selected
    } else if (tabName === 'MyPossessions') {
        displayUserPossessions(); // Display possessions when the My Possessions tab is selected
    }
}


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('jokeButton').addEventListener('click', function() {
        console.log("Joke button clicked");
        fetchJoke();
    });
});

console.log("Script loaded");

function fetchJoke() {
    showLoader(); // Show the loader before the fetch starts

    fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer REMOVED'  // Replace with your actual API key
        },
        body: JSON.stringify({
            prompt: "Create a humorous and engaging short story that forms a really funny joke within 150 tokens. The story must be complete within 150 tokens. The story or conversation should be lighthearted, clever, and evoke laughter. It should be suitable for a general audience, avoiding sensitive topics.",
            max_tokens: 150,  // Adjust as needed for joke length
            temperature: 0.7  // Adjust for creativity
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('jokeContent').textContent = data.choices[0].text.trim();
        document.getElementById('jokeDialog').style.display = 'block';
        hideLoader(); // Hide the loader after processing the joke
    })
    .catch(error => {
        error.response.json().then(errorData => {
            console.error('Error response from OpenAI:', errorData);
            hideLoader();
        });
    });
}


function closeJokeDialog() {
    document.getElementById('jokeDialog').style.display = 'none';
}


function updateTaskList(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.category}`; // Apply category as a class for color coding

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.onclick = (event) => {
        event.stopPropagation();
        if (checkbox.checked) {
        deleteTask(task.text, event);
        calculateCoins(task.createdTime); // Calculate coins based on task creation time
        }
    };

        li.appendChild(checkbox);

        // Task Text
        const text = document.createElement('span');
        text.innerText = task.text;
        text.className = 'task-text';
        li.appendChild(text);

        // Suggestion button
        const suggestBtn = document.createElement('button');
        suggestBtn.innerText = 'Suggestion';
        suggestBtn.className = 'suggest-btn';
        suggestBtn.onclick = () => getTaskSuggestion(task.text, li); // Set onclick event
        li.appendChild(suggestBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = (event) => deleteTask(task.text, event);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
}

window.onload = setupEventListeners;