const API_URL = 'https://my-backend.github.io'; // Replace with your backend GitHub Pages URL
let currentUser = null;
let token = null;

// DOM Elements
const errorElement = document.getElementById('error');
const todoErrorElement = document.getElementById('todoError');
const metadataElement = document.getElementById('metadata');

// Event Listeners
document.getElementById('signup').addEventListener('click', () => auth('signup'));
document.getElementById('login').addEventListener('click', () => auth('login'));
document.getElementById('logout').addEventListener('click', logout);
document.getElementById('addTodo').addEventListener('click', addTodo);

async function auth(action) {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (action === 'signup') {
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
      errorElement.textContent = 'Passwords do not match.';
      return;
    }
  }

  try {
    const res = await fetch(`${API_URL}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.token) {
      token = data.token;
      currentUser = username;
      document.getElementById('auth').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      document.getElementById('currentUser').textContent = username;
      loadUserData();
      loadTodos();
    } else {
      errorElement.textContent = data.error || 'Authentication failed.';
    }
  } catch (err) {
    errorElement.textContent = 'Network error. Please try again.';
  }
}

async function loadUserData() {
  const res = await fetch(`${API_URL}/userdata`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  metadataElement.textContent = `Signup Date: ${data.user_signup_datetime}`;
}

async function loadTodos() {
  const res = await fetch(`${API_URL}/todos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const todos = await res.json();
  const todosList = document.getElementById('todos');
  todosList.innerHTML = '';
  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.textContent = `${todo.text} (Created: ${todo.creationDate})`;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteTodo(index);
    const completeButton = document.createElement('button');
    completeButton.textContent = todo.checked ? 'Undo' : 'Complete';
    completeButton.onclick = () => toggleTodoCompletion(index);
    li.appendChild(deleteButton);
    li.appendChild(completeButton);
    todosList.appendChild(li);
  });
}

async function addTodo() {
  const newTodo = document.getElementById('newTodo').value;
  const res = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: newTodo }),
  });

  if (res.ok) {
    loadTodos();
  } else {
    todoErrorElement.textContent = 'Failed to add todo.';
  }
}

async function deleteTodo(index) {
  const res = await fetch(`${API_URL}/todos/${index}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) loadTodos();
}

async function toggleTodoCompletion(index) {
  const res = await fetch(`${API_URL}/todos/${index}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) loadTodos();
}

function logout() {
  currentUser = null;
  token = null;
  document.getElementById('auth').style.display = 'block';
  document.getElementById('app').style.display = 'none';
}
