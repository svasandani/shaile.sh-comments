let form = document.querySelector('form');
let input = document.querySelector("#userKey");

let apiKey = "";
let commentData = {};

const buildComment = (data) => {
  return `
<tr>
  <td>${data.path}</td>
  <td>${data.name}</td>
  <td>${data.email}</td>
  <td>${data.title}</td>
  <td>${data.body}</td>
  <td>${data.replyTo}</td>
  <td>${data.date}</td>
  <td class="button-col">
    <div class="input-group">
      <button type="button" class="btn btn-primary pub-button" data-id="${data._id}" data-action="${data.published ? `unpublish"> Unpublish` : `publish"> Publish`}
      </button>
      <button type="button" class="btn btn-danger del-button" data-id="${data._id}" data-action="delete">
        Del
      </button>
    </div>
  </td>
</tr>
  `
}

const addDelListener = (el) => {
  el.addEventListener('click', () => {
    if (!confirm('Are you sure?')) return;
    fetch('/comment', {
      method: 'DELETE',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: el.dataset.id })
    })
      .then(updateData)
  })
}

const addPublishListener = (el) => {
  el.addEventListener('click', () => {
    fetch('/' + el.dataset.action, {
      method: 'PUT',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: el.dataset.id })
    })
      .then(updateData)
  })
}

const populateTable = (tableEl, tableData) => {
  Array.from(tableEl.children).forEach(el => {
    if (el.nodeName === "TBODY") tableEl.removeChild(el);
  });

  let tbody = document.createElement('TBODY');

  tableData.forEach(data => {
    tbody.insertAdjacentHTML('beforeEnd', buildComment(data));
  });
  
  tableEl.appendChild(tbody);

  Array.from(tbody.querySelectorAll(".pub-button")).forEach(el => {
    addPublishListener(el);
  })

  Array.from(tbody.querySelectorAll(".del-button")).forEach(el => {
    addDelListener(el);
  })
}

const populateTables = () => {
  const pub = [];

  const unpub = commentData.reduce((acc, curr) => {
    if (curr.published) {
      pub.push(curr);
    }
    else acc.push(curr);
    return acc;
  }, []);

  let unpubEl = document.querySelector('#unpublished');
  let pubEl = document.querySelector('#published');

  populateTable(unpubEl, unpub);
  populateTable(pubEl, pub);
}

const updateData = () => {
  fetch('/comments', {
    headers: {
      'Authorization': apiKey
    }
  })
    .then(response => {
      if (response.status != 200) throw new Error('Something went wrong...');
      else return response.json()
    })
    .then(data => {
      commentData = data;
      populateTables();
    })
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  let key = input.value;

  fetch('/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key })
  })
    .then(response => {
      if (response.status != 200) throw new Error('Something went wrong...');
      else return response.json()
    })
    .then(data => {
      if (input.classList.contains('is-invalid')) input.classList.remove('is-invalid');
      apiKey = data.api_key;
      updateData();
    })
    .catch(err => {
      input.classList.add('is-invalid');
    })
}, false)